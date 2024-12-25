import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "./utils/supabase.js";

const CardLarge = (props) => {

    const { id: postId } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);

    const [loadingPost, setLoadingPost] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const { data, error } = await supabase
                    .from("post")
                    .select(`
                        id, 
                        created_by, 
                        created_at, 
                        title, 
                        abstract, 
                        text,
                        image_url, 
                        user (
                            first_name,
                            last_name,
                            user_name,
                            unique_user_name,
                            email
                        )`)
                    .eq("id", postId)
                    .single();

                if (error) throw error;

                const transformedPost = {
                    ...data,
                    tags: data.post_tags?.map((tagRelation) => tagRelation.tag.name) || [],
                };

                setPost(transformedPost);
            } catch (error) {
                setError(error.message);
                setPost(null);
            } finally {
                setLoadingPost(false);
            }
        };
        fetchPost();
    }, [postId])
    

    const handleUsernameClick = () => {
        navigate(`/user/${props.post_user_id}`);
    };

    if (loadingPost) return <div>Loading post...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!post) return <div>Post not found</div>;

    return (
        <div className="card bg-white text-center h-100">
            <div className="card-header bg-white">
                <button
                    type="button"
                    className="btn btn-light"
                    onClick={handleUsernameClick}
                >
                    @{props.post_unique_user_name}
                </button>
            </div>
            {props.image_url ? (
                <img
                    src={props.image_url}
                    alt={props.title}
                    style={{ height: "200px", objectFit: "cover" }}
                />
            ) : (
                <img
                    src="/BLOGPOST_cover_photo_bootstrap_primary.png"
                    alt={props.title}
                    style={{ height: "200px", objectFit: "cover" }}
                />
            )}
            <div className="card-body bg-white">
                <h5 className="card-title">{props.title}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{props.abstract}</h6>
                <p className="card-text">{props.text}</p>
            </div>
            <div className="card-footer bg-white text-muted">
                <p className="card-text small text-muted">{props.date}</p>
            </div>
        </div>
    );
};

export default CardLarge;
