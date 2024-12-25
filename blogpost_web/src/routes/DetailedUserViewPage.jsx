import React, { useState, useEffect, useContext } from "react";
import Card from "../Card";
import { useParams } from "react-router-dom"; // For getting route parameters
import supabase from "../utils/supabase";
import { SessionContext } from "../context/userSession.context";
import FollowSection from "../FollowSection";

function CardComponent({ id, title, abstract, user, created_at, created_by, image_url }) {
  const date = new Date(created_at).toISOString().split("T")[0];

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

const DetailedUserViewPage = () => {
  const session = useContext(SessionContext);
  const { id: targetUserID } = useParams();
  const [targetUser, setTargetUser] = useState(null); // User data state
  const [postsList, setPostsList] = useState([]);
  const [loading, setLoading] = useState(true); // Loading
  const currentUserID = session?.user?.id;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch user details
        const { data: userData, error: userError } = await supabase
          .from("user")
          .select("*")
          .eq("id", targetUserID)
          .single();

        if (userError) {
          console.error('Supabase error fetching user:', userError);
          throw userError;  // Rethrow the error to be caught in the catch block
        }

        setTargetUser(userData);

        // Fetch posts by the target user
        const { data: postData, error: postError } = await supabase
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
          .eq("created_by", targetUserID);

        if (postError) {
          console.error('Supabase error fetching posts:', postError);
          throw postError;
        }

        setPostsList(postData);
      } catch (error) {
        console.error("Error:", error.message);
        setTargetUser(null);
        setPostsList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [targetUserID, currentUserID]);

  if (loading) {
    return <div className="container mt-5 text-center">Loading user profile...</div>;
  }

  if (!targetUser) {
    return <div className="container mt-5 text-center">User not found.</div>;
  }

  return (
    <div className="container">
      <div className="card text-center">
        <div className="card-header bg-white">{targetUser.user_name}</div>
        <div className="card-body bg-white">
          <h5 className="card-title">@{targetUser.unique_user_name}</h5>
          <h6 className="card-subtitle">{targetUser.first_name + " " + targetUser.last_name || "N/A"}</h6>
          <h6 className="card-subtitle">{targetUser.email}</h6>
        </div>
        <FollowSection targetUserID={targetUserID} currentUserID={currentUserID} />
        <div className="card-footer bg-white small text-muted">
          Joined on {new Date(targetUser.created_at).toISOString().split("T")[0]}
        </div>
      </div>
      <div className="row my-3">
        {postsList.length > 0 ? (
          postsList.map((article) => (
            <CardComponent key={article.id} {...article} />
          ))
        ) : (
          <p className="text-center">{targetUser.user_name} hasn't posted anything yet...</p>
        )}
      </div>
    </div>
  );
};

export default DetailedUserViewPage;
