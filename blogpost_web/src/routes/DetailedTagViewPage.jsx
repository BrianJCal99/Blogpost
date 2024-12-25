import React, { useState, useEffect } from "react";
import Card from "../Card";
import supabase from "../utils/supabase";
import { useParams } from 'react-router-dom'; // For getting route parameters

function CardComponent({ id, title, abstract, user, created_at, created_by, image_url }) {
    const date = new Date(created_at).toISOString().split('T')[0];
  
    return (
        <Card
            post_id={id}
            title={title}
            abstract={abstract}
            post_user={user?.unique_user_name}
            post_user_id={created_by}
            date={date}
            image_url={image_url}
        />
    );
  }

const DetailedTagViewPage = () => {
    const { id: tagId } = useParams(); // Get the post ID from the URL
    const [tagName, setTagName] = useState(null); // State for the tag name
    const [postsList, setPostsList] = useState(null); // Post data state
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Fetch tag name
                const { data: tagData, error: tagError } = await supabase
                    .from("tag")
                    .select("name")
                    .eq("id", tagId)
                    .single();

                if (tagError) throw tagError;

                setTagName(tagData.name);

                // Fetch post IDs associated with the tag ID
                const { data: postData, error: postError } = await supabase
                    .from("post_tag")
                    .select("post_id")
                    .eq("tag_id", tagId);
    
                if (postError) throw postError;
    
                const postIds = postData.map(item => item.post_id);
    
                // Fetch posts by IDs
                const { data: postsData, error: postsError } = await supabase
                    .from("post")
                    .select(`
                        id, 
                        created_by, 
                        created_at, 
                        title, 
                        abstract, 
                        text, 
                        image_url,
                        user: created_by (
                          first_name,
                          last_name,
                          user_name,
                          unique_user_name,
                          email
                        )
                    `)
                    .in("id", postIds);
    
                if (postsError) throw postsError;
    
                setPostsList(postsData);
            } catch (error) {
                console.error("Error fetching posts:", error);
                setPostsList(null);
            } finally {
                setLoading(false);
            }
        };
    
        fetchPosts();
    }, [tagId]);    

    if (loading) {
        return <div className="container my-4 text-center">Loading posts...</div>;
    }
    
    if (!postsList) {
        return <div className="container my-4 text-center">No posts for #{tagName}</div>;
    }
    
    return (
        <div className="container">
            <div className="row">
                <div className="col text-center">
                    <h1>
                        <span className="badge badge-light text-dark m-4">
                            #{tagName}
                            <span className="small text-muted ml-3">
                                {postsList.length} {postsList.length === 1 ? "post" : "posts"}
                            </span>
                        </span>
                    </h1>
                </div>
            </div>
            <div className="row">
              {postsList.map((post) => (
                <CardComponent key={post.id} {...post} />
              ))}
            </div>
        </div>
    )
}

export default DetailedTagViewPage;