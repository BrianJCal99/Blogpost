import { useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from "react-hot-toast";

import supabase from "../utils/supabase";

// Find a tag by name, creating it if it doesn't exist yet.
// Uses select-then-insert instead of upsert, because upsert needs UPDATE
// permission on the tag table and members shouldn't be able to rename tags.
async function getOrCreateTagId(name) {
    const findTag = () => supabase.from('tag').select('id').eq('name', name).maybeSingle();

    const { data: existing, error: findError } = await findTag();
    if (findError) throw findError;
    if (existing) return existing.id;

    const { data: created, error: insertError } = await supabase
        .from('tag')
        .insert({ name })
        .select('id')
        .single();

    if (!insertError) return created.id;

    // Someone else created the same tag a moment ago: use theirs
    if (insertError.code === '23505') {
        const { data: raced, error: retryError } = await findTag();
        if (retryError) throw retryError;
        if (raced) return raced.id;
    }
    throw insertError;
}

// Minimum post length before AI suggestions are allowed (matches the Edge Function)
const MIN_TEXT_FOR_SUGGESTIONS = 100;

// Split a tags string like "#Food #easy-meals" into lowercase single words,
// using the same rule as publishing (and the tag table's check constraint).
function parseTags(tagString) {
    return tagString.toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter(tag => tag.length > 0);
}

// Turn a failed functions.invoke() call into a friendly message
async function suggestionErrorMessage(error) {
    // The Edge Function returns { error: "..." } with a user-friendly message,
    // e.g. "AI is busy..." or the daily-limit notice
    try {
        const body = await error.context.json();
        if (typeof body?.error === 'string') return body.error;
    } catch {
        // Not JSON (network failure, gateway error...): fall through
    }
    const status = error?.context?.status;
    if (status === 429 || status === 503) return "AI is busy, try again in a minute";
    return "Couldn't get suggestions right now";
}

function NewPost() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user) // Redux state
    const [post, setPost] = useState({
        title: '',
        abstract: '',
        text: '',
        tags: '', // Tags input as a comma-separated string
    });

    const [image, setImage] = useState(null); // For the selected image file
    const [suggesting, setSuggesting] = useState(false); // AI suggestion request in flight
    const { title, abstract, text, tags } = post;

    // Always holds the latest form values, for use after an await
    const postRef = useRef(post);
    postRef.current = post;

    const charsNeededForSuggestions = MIN_TEXT_FOR_SUGGESTIONS - text.trim().length;

    // Ask the suggest-post-meta Edge Function for an abstract and tags.
    // Only fills the form: nothing is saved until the writer clicks Post.
    const handleSuggest = async () => {
        if (suggesting || charsNeededForSuggestions > 0) return;
        setSuggesting(true);
        try {
            const { data, error } = await supabase.functions.invoke('suggest-post-meta', {
                body: { title, text },
            });
            if (error) {
                toast.error(await suggestionErrorMessage(error));
                return;
            }

            // Read the latest form values: the writer may have kept typing while we waited
            const current = postRef.current;

            let newAbstract = current.abstract;
            const existingAbstract = current.abstract.trim();
            if (!existingAbstract) {
                newAbstract = data.abstract;
            } else if (existingAbstract !== data.abstract
                && window.confirm(`Replace your abstract with this suggestion?\n\n"${data.abstract}"`)) {
                newAbstract = data.abstract;
            }

            // Add suggested tags the writer hasn't already typed (in any case or format)
            const alreadyTyped = new Set(parseTags(current.tags));
            const newTags = data.tags.filter(tag => !alreadyTyped.has(tag)).map(tag => `#${tag}`);
            const mergedTags = [current.tags.trim(), ...newTags].filter(Boolean).join(' ');

            setPost(prev => ({ ...prev, abstract: newAbstract, tags: mergedTags }));
            toast.success("Suggestions added. Edit them before publishing.");
        } catch {
            toast.error("Couldn't get suggestions right now");
        } finally {
            setSuggesting(false);
        }
    };

    const handleChange = (event) => {
        const { id, value } = event.target;
        setPost((prevValue) => ({
            ...prevValue,
            [id]: value,
        }));
    };

    const handleImageChange = (event) => {
        setImage(event.target.files[0]); // Store the selected file
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        let imageUrl = null;
    
        if (image) {
            // Upload the image to Supabase
            const { data, error: uploadError } = await supabase.storage
                .from('post_image')
                .upload(`${user?.id}/${Date.now()}-${image.name}`, image);
    
            if (uploadError) {
                toast.error(`Image upload failed: ${uploadError.message}`);
                // console.error('Image upload failed:', uploadError);
                return;
            }
    
            // Generate the public URL of the uploaded image
            const { data: publicUrlData } = supabase.storage
                .from('post_image')
                .getPublicUrl(data.path);
    
            imageUrl = publicUrlData.publicUrl;
        }
    
        try {
            // Insert the post into the database
            const { data: postData, error: postError } = await supabase
                .from('post')
                .insert({
                    title,
                    abstract,
                    text,
                    image_url: imageUrl,
                    created_by: user?.id, // Reference to the logged-in user
                })
                .select()
                .single();
    
            if (postError) throw postError;
    
            const postId = postData.id;
    
            // Process tags and insert into post_tag table
            // Tags are single lowercase words: anything that isn't a letter or digit
            // (spaces, #, commas, hyphens...) separates tags, so "#budget-travel"
            // becomes "budget" and "travel". Then drop repeats.
            const processedTags = [...new Set(
                tags.toLowerCase()
                    .split(/[^\p{L}\p{N}]+/u)
                    .filter(tag => tag.length > 0) // Remove empty strings
            )];

            for (const tagName of processedTags) {
                const tagId = await getOrCreateTagId(tagName);
    
                // Associate the tag with the post in the post_tag table
                const { error: postTagError } = await supabase
                    .from('post_tag')
                    .insert({ post_id: postId, tag_id: tagId });
    
                if (postTagError) throw postTagError;
            }
    
            toast.success("You have successfully posted your new post!");
            navigate("/myposts");
        } catch (error) {
            toast.error(`Error creating post: ${error.message}`);
            // console.error("Error creating post:", error.message);
        }
    };
    

    return (
        <div>
            <form>
                <div className="form-group m-3">
                    <label htmlFor="title">Title: </label>
                    <input
                        type="text"
                        className="form-control"
                        id="title"
                        placeholder="Enter a descriptive title"
                        value={title}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group m-3">
                    <label htmlFor="abstract">Abstract: </label>
                    <textarea
                        className="form-control"
                        id="abstract"
                        placeholder="Enter a 1-paragraph abstract"
                        value={abstract}
                        onChange={handleChange}
                    ></textarea>
                </div>
                <div className="form-group m-3">
                    <label htmlFor="text">Text: </label>
                    <textarea
                        rows="4"
                        cols="50"
                        className="form-control"
                        id="text"
                        placeholder="Enter the post text"
                        value={text}
                        onChange={handleChange}
                    ></textarea>
                </div>
                <div className="form-group mx-3 d-flex flex-wrap align-items-center gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleSuggest}
                        disabled={suggesting || charsNeededForSuggestions > 0}
                        aria-describedby="suggest-hint"
                    >
                        {suggesting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Suggesting…
                            </>
                        ) : (
                            "✨ Suggest summary & tags"
                        )}
                    </button>
                    <small id="suggest-hint" className="text-muted">
                        {charsNeededForSuggestions > 0
                            ? `Write ${charsNeededForSuggestions} more character${charsNeededForSuggestions === 1 ? '' : 's'} to get AI suggestions.`
                            : "AI suggests an abstract and tags. You can edit them before posting."}
                    </small>
                </div>
                <div className="form-group m-3">
                    <label htmlFor="tags">Tags (#): </label>
                    <input
                        type="text"
                        className="form-control"
                        id="tags"
                        placeholder="Enter tags separated by # (e.g., '#Food #Coding')"
                        value={tags}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group m-3">
                    <label htmlFor="image">Image: </label>
                    <input
                        type="file"
                        className="form-control"
                        id="image"
                        onChange={handleImageChange}
                    />
                </div>
                <button type="submit" className="btn btn-primary m-3" onClick={handleSubmit}>
                    Post
                </button>
            </form>
        </div>
    );
}

export default NewPost;
