import React, { useEffect, useState } from "react";
import Card from "./Card.jsx";
import supabase from "../utils/supabase.js";

function CardComponent({ post }) {
  const date = new Date(post.created_at).toISOString().split("T")[0];

  return (
    <Card
      post_id={post.id}
      title={post.title}
      abstract={post.abstract}
      post_user={post.user?.unique_user_name}
      date={date}
      post_user_id={post.created_by}
      image_url={post.image_url}
    />
  );
}

const PostList = ({ limit }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      let query = supabase
        .from("post")
        .select(`
          id,
          created_by,
          created_at,
          title,
          abstract,
          image_url,
          user:created_by (
            unique_user_name
          )
        `)
        .order("created_at", { ascending: false });

      if (limit) query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error(error.message);
        setError(error.message);
      } else {
        setPosts(data);
      }

      setLoading(false);
    };

    fetchPosts();
  }, [limit]);

  if (loading) {
    return <div className="container mt-5 text-center">Loading posts...</div>;
  }

  if (error) {
    return <div className="container mt-5 text-center">Error loading posts</div>;
  }

  if (posts.length === 0) {
    return <div className="container mt-5 text-center">No posts available...</div>;
  }

  return (
    <div className="row">
      {posts.map((post) => (
        <CardComponent key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;