import React, { useEffect, useState, useContext } from "react";
import Card from "../Card";
import supabase from "../utils/supabase";
import { SessionContext } from "../context/userSession.context";
import { Link } from 'react-router-dom';

function CardComponent({ id, title, abstract, user, created_at, created_by, image_url, likes, liked_by }) {
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

const UserPostsPage = () => {
  const session = useContext(SessionContext);
  const [articleList, setArticleList] = useState([]); // User's posts
  const [likedArticleList, setLikedArticleList] = useState([]); // Liked posts
  const [followedArticleList, setFollowedArticleList] = useState([]); // Posts from followed users
  const [followedUsers, setFollowedUsers] = useState([]); // Track followed users
  const [loading, setLoading] = useState(true); // Loading state
  const [activeTab, setActiveTab] = useState("myPosts"); // State for tab switching

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);

        // Fetch the posts created by the user
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
          `)
          .eq('created_by', session?.user.id);

        if (error) throw error;
        setArticleList(data);
      } catch (error) {
        console.error('Error fetching user posts:', error.message);
        setArticleList(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchLikedPosts = async () => {
      try {
        setLoading(true);

        // Fetch posts liked by the user via the 'like' table
        const { data, error } = await supabase
          .from('like')
          .select(`
            post (
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
            )
          `)
          .eq('user_id', session?.user.id); // User ID for liked posts

        if (error) throw error;
        setLikedArticleList(data.map(item => item.post)); // Extract posts from the data
      } catch (error) {
        console.error('Error fetching liked posts:', error.message);
        setLikedArticleList([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchFollowedPosts = async () => {
      try {
        setLoading(true);

        // Fetch posts from users followed by the logged-in user
        const { data: followData, error: followError } = await supabase
          .from('follow')
          .select('followee_id')  // Get followed user IDs
          .eq('follower_id', session?.user.id);

        if (followError) throw followError;

        const followedUserIds = followData.map(follow => follow.followee_id);
        setFollowedUsers(followedUserIds); // Store followed user IDs

        // Now fetch posts from followed users
        const { data: followedPosts, error: postsError } = await supabase
          .from('post')
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
            )
          `)
          .in('created_by', followedUserIds);  // Filter posts by followed user IDs

        if (postsError) throw postsError;
        setFollowedArticleList(followedPosts);
      } catch (error) {
        console.error('Error fetching followed posts:', error.message);
        setFollowedArticleList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
    fetchLikedPosts();
    fetchFollowedPosts();
  }, [session]);

  if (loading) {
    return <div className="container mt-5 text-center">Loading user posts...</div>;
  }

  if (!articleList) {
    return <div className="container mt-5 text-center">No posts found.</div>;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col text-center">
          <h2 className="my-3">My Content</h2>
          <div className="btn-group" role="group" aria-label="Tab navigation">
            <button
              type="button"
              className={`btn ${activeTab === "myPosts" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setActiveTab("myPosts")}
            >
              My Posts
            </button>
            <button
              type="button"
              className={`btn ${activeTab === "likedPosts" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setActiveTab("likedPosts")}
            >
              Liked Posts
            </button>
            <button
              type="button"
              className={`btn ${activeTab === "followedPosts" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setActiveTab("followedPosts")}
            >
              Followed Posts
            </button>
          </div>
        </div>
      </div>

      {activeTab === "myPosts" && (
        <div className="row my-4">
          {articleList.length === 0 ? (
            <div className="text-center w-100">
              <h4>Hmmm... Looks like you haven't posted anything yet.</h4>
              <h5>Start blogging now.</h5>
              <Link to="/newpost" className="btn btn-primary m-3">New Post</Link>
            </div>
          ) : (
            <div className="row">
              {articleList.map((article) => (
                <CardComponent key={article.id} {...article} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "likedPosts" && (
        <div className="row mt-4">
          {likedArticleList.length === 0 ? (
            <div className="text-center w-100">
              <h4>You haven't liked any posts yet.</h4>
              <h5>Start reading now.</h5>
              <Link to="/posts" className="btn btn-primary m-3">Browse Posts</Link>
            </div>
          ) : (
            <div className="row">
              {likedArticleList.map((article) => (
                <CardComponent key={article.id} {...article} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "followedPosts" && (
        <div className="row mt-4">
          {followedArticleList.length === 0 ? (
            followedUsers.length === 0 ? ( // Check if the user is following anyone
              <div className="text-center w-100">
                <h4>You aren't following anyone yet.</h4>
                <h5>Start following users to see their posts.</h5>
                <Link to="/users" className="btn btn-primary m-3">Browse Users</Link>
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
      )}
    </div>
  );
};

export default UserPostsPage;
