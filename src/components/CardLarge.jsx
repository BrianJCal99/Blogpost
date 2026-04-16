import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../utils/supabase.js";
import PostSettingsDropdown from "./PostSettingsDropdown.jsx";

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
          .select(
            `
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
                        )`,
          )
          .eq("id", postId)
          .single();

        if (error) throw error;

        const transformedPost = {
          ...data,
          tags:
            data.post_tags?.map((tagRelation) => tagRelation.tag.name) || [],
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
  }, [postId]);

  const handleUsernameClick = (e) => {
    navigate(`/user/${props.post_user_id}`);
  };

  if (loadingPost) return <div>Loading post...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="card">
      {props.image_url ? (
        <img src={props.image_url} alt={props.title} className="card-img-top" />
      ) : (
        <img
          src="/BLOGPOST_cover_photo_bootstrap_primary.png"
          alt={props.title}
          className="card-img-top"
        />
      )}
      <div className="card-body">
        <h5 className="card-title">{props.title}</h5>
        <h6 className="card-subtitle mb-2 text-muted">{props.abstract}</h6>
        <p className="card-text">{props.text}</p>
        <div
            onClick={handleUsernameClick}
            className="card-text text-muted"
            style={{ cursor: "pointer" }}
          >
            @{props.post_unique_user_name}
          </div>
        <p className="card-text text-muted">{props.date}</p>
      </div>
      <div className="card-footer bg-white d-flex justify-content-end">
        <PostSettingsDropdown
          post_id={postId}
          post_user_id={props.post_user_id}
        />
      </div>
    </div>
  );
};

export default CardLarge;
