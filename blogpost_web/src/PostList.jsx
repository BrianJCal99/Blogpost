import React, { useEffect, useState } from "react";
import Card from "./Card.jsx";
import supabase from "./utils/supabase.js";


function CardComponent({ id, title, abstract, user, created_at, created_by, image_url, likes, liked_by }) {
  const date = new Date(created_at).toISOString().split('T')[0];

  return (
      <Card
          post_id={id}
          title={title}
          abstract={abstract}
          post_user={user?.unique_user_name}
          date={date}
          post_user_id={created_by}
          image_url={image_url}
      />
  );
}

const PostList = ({limit}) => {
    const [articleList, setArticleList] = useState([]);
    const [loading, setLoading] = useState(true); // State for loading

    useEffect(() => {
        const fetchData = async () => {
          const { data, error } = await supabase
            .from('post')
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
            `);

    
          if (error) {
            console.error(error.message);
          } else {
            // console.log(data);
            setArticleList(data);
          }
          setLoading(false);
        };
    
        fetchData();
      }, []);

    if (loading) {
      return <div className="container mt-5 text-center">Loading posts...</div>;
    }

    if (!articleList || articleList.length === 0) {
    return <div className="container mt-5 text-center">No posts available...</div>;
    }
    
    // If a limit is passed, slice the articleList
    const displayedArticles = limit ? articleList.slice(0, limit) : articleList;

    
    
    return(
        <div className="row">
            {displayedArticles.map((article) => (
                <CardComponent key={article.id} {...article} />
            ))}
            
        </div>
    )
}

export default PostList;