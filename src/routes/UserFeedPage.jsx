import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Card from "../components/Card";
import supabase from "../utils/supabase";
import { Link } from "react-router-dom";

function CardComponent({
  id,
  title,
  abstract,
  user,
  created_at,
  created_by,
  image_url,
  likes,
  liked_by,
}) {
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

const UserFeedPage = () => {
  const { user } = useSelector((state) => state.user); // Redux state
  const [followedArticleList, setFollowedArticleList] = useState([]); // Posts from followed users
  const [followedUsers, setFollowedUsers] = useState([]); // Track followed users
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchFollowedPosts = async () => {
      try {
        setLoading(true);

        // Fetch posts from users followed by the logged-in user
        const { data: followData, error: followError } = await supabase
          .from("follow")
          .select("followee_id") // Get followed user IDs
          .eq("follower_id", user?.id);

        if (followError) throw followError;

        const followedUserIds = followData.map((follow) => follow.followee_id);
        setFollowedUsers(followedUserIds); // Store followed user IDs

        // Now fetch posts from followed users
        const { data: followedPosts, error: postsError } = await supabase
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
            )
          `,
          )
          .in("created_by", followedUserIds) // Filter posts by followed user IDs
          .order("created_at", { ascending: false }); // Order by created_at in descending order

        if (postsError) throw postsError;
        setFollowedArticleList(followedPosts);
      } catch (error) {
        console.error("Error fetching followed posts:", error.message);
        setFollowedArticleList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowedPosts();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="container text-center my-5">
        <h4>Your feed is empty!</h4>
        <p>Sign in or create an account to follow users and see their posts here.</p>
        <Link to="/signin" className="btn btn-primary m-2">
          Sign In
        </Link>
        <Link to="/signup" className="btn btn-outline-primary m-2">
          Create Account
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-5 text-center">Loading your feed...</div>
    );
  }

  return (
    <div className="container">
      <div className="row mt-4">
        {followedArticleList.length === 0 ? (
          followedUsers.length === 0 ? ( // Check if the user is following anyone
            <div className="text-center w-100">
              <h4>You aren't following anyone yet.</h4>
              <h5>Start following users to see their posts.</h5>
              <Link to="/users" className="btn btn-primary m-3">
                Browse Users
              </Link>
            </div>
          ) : (
            <div className="text-center w-100">
              <h4>People you follow haven't posted anything yet.</h4>
              <h5>Stay tuned for updates!</h5>
            </div>
          )
        ) : (
          <div className="row">
            {followedArticleList.map((article) => (
              <CardComponent key={article.id} {...article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFeedPage;
