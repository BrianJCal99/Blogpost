import { useState } from "react";
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
    const { title, abstract, text, tags } = post;

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
