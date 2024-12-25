import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import supabase from "./utils/supabase";
import { SessionContext } from "./context/userSession.context";

function NewPost() {
    const session = useContext(SessionContext);
    const navigate = useNavigate();

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
                .upload(`${session?.user?.id}/${Date.now()}-${image.name}`, image);
    
            if (uploadError) {
                alert(`Image upload failed: ${uploadError.message}`);
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
                    created_by: session?.user?.id, // Reference to the logged-in user
                })
                .select()
                .single();
    
            if (postError) throw postError;
    
            const postId = postData.id;
    
            // Process tags and insert into post_tag table
            const processedTags = tags.split(/[#,\s]+/)
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0); // Remove empty strings
    
            for (const tagName of processedTags) {
                // Use upsert to avoid inserting duplicate tags
                const { data: tagData, error: tagError } = await supabase
                    .from('tag')
                    .upsert({ name: tagName }, { onConflict: 'name' })
                    .select('id')
                    .single();
    
                if (tagError) throw tagError;
    
                const tagId = tagData.id;
    
                // Associate the tag with the post in the post_tag table
                const { error: postTagError } = await supabase
                    .from('post_tag')
                    .insert({ post_id: postId, tag_id: tagId });
    
                if (postTagError) throw postTagError;
            }
    
            alert("You have successfully posted your new post!");
            navigate("/myposts");
        } catch (error) {
            console.error("Error creating post:", error.message);
            alert(error.message);
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
