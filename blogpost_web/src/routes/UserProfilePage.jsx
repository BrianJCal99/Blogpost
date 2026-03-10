import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import supabase from "../utils/supabase";
import Card from "../components/Card";
import FollowSection from "../components/FollowSection";

function CardComponent({
  id,
  title,
  abstract,
  user,
  created_at,
  created_by,
  image_url,
  tags,
  likes,
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

const UserProfilePage = () => {
  const { user } = useSelector((state) => state.user); // Redux state
  const [articleList, setArticleList] = useState([]); // User's posts
  const [likedArticleList, setLikedArticleList] = useState([]); // Liked posts
  const [savedArticleList, setSavedArticleList] = useState([]); // Saved posts
  const [loading, setLoading] = useState(true); // Loading state
  const [activeTab, setActiveTab] = useState("myPosts"); // State for tab switching

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);

        // Fetch the posts created by the user
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
            user: created_by (
              first_name,
              last_name,
              user_name,
              unique_user_name,
              email
            )
          `,
          )
          .eq("created_by", user?.id) // User ID for posts
          .order("created_at", { ascending: false }); // Order by created_at in descending order

        if (error) throw error;
        setArticleList(data);
      } catch (error) {
        console.error("Error fetching user posts:", error.message);
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
          .from("like")
          .select(
            `
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
          `,
          )
          .eq("user_id", user?.id) // User ID for liked posts
          .order("created_at", { ascending: false }); // Order by created_at in descending order

        if (error) throw error;
        setLikedArticleList(data.map((item) => item.post)); // Extract posts from the data
      } catch (error) {
        console.error("Error fetching liked posts:", error.message);
        setLikedArticleList([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchSavedPosts = async () => {
      try {
        setLoading(true);

        // Fetch posts saved by the user
        const { data, error } = await supabase
          .from("save")
          .select(
            `
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
          `,
          )
          .eq("user_id", user?.id) // User ID for saved posts
          .order("created_at", { ascending: false }); // Order by created_at in descending order

        if (error) throw error;
        setSavedArticleList(data.map((item) => item.post));
      } catch (error) {
        console.error("Error fetching saved posts:", error.message);
        setSavedArticleList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
    fetchLikedPosts();
    fetchSavedPosts();
  }, [user]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">Loading user posts...</div>
    );
  }

  if (!articleList) {
    return (
      <div className="container mt-5 text-center">
        You haven't posted anything yet...
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        {user ? (
          <div className="card text-center">
            <div className="card-header bg-white text-center position-relative">
              <span>{user?.user_metadata?.userName}</span>
              <button className="btn p-0 border-0 bg-transparent position-absolute end-0 top-50 translate-middle-y me-3">
                <i className="bi bi-sliders"></i>
              </button>
            </div>
            <div className="card-body bg-white">
              <h5 className="card-title">
                @{user?.user_metadata?.uniqueUserName}
              </h5>
              <h6 className="card-subtitle">
                {user?.user_metadata?.firstName +
                  " " +
                  user?.user_metadata?.lastName || "User Name"}
              </h6>
              <h6 className="card-subtitle">
                {user?.user_metadata?.email || "User Email"}
              </h6>
            </div>
            <FollowSection targetUserID={user?.id} currentUserID={user?.id} />
            <div className="card-footer bg-white small text-muted">
              Joined on {new Date(user?.created_at).toISOString().split("T")[0]}
            </div>
          </div>
        ) : (
          <div className="container text-center my-3">
            <div className="alert alert-primary m-3" role="alert">
              Please{" "}
              <Link to="/signin" className="btn btn-primary m-3">
                Sign in
              </Link>
              to continue.
            </div>
          </div>
        )}
      </div>
      <div className="row">
        <div className="col text-center">
          <div
            className="btn-group mt-5"
            role="group"
            aria-label="Tab navigation"
          >
            <button
              type="button"
              className={`btn ${activeTab === "myPosts" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setActiveTab("myPosts")}
            >
              <i className="bi bi-person mr-2"></i>
              My Posts
            </button>
            <button
              type="button"
              className={`btn ${activeTab === "likedPosts" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setActiveTab("likedPosts")}
            >
              <i className="bi bi-hand-thumbs-up mr-2"></i>
              Liked Posts
            </button>
            <button
              type="button"
              className={`btn ${activeTab === "savedPosts" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setActiveTab("savedPosts")}
            >
              <i className="bi bi-bookmark-check mr-2"></i>
              Saved Posts
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
              <Link to="/newpost" className="btn btn-primary m-3">
                New Post
              </Link>
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
              <Link to="/posts" className="btn btn-primary m-3">
                Browse Posts
              </Link>
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

      {activeTab === "savedPosts" && (
        <div className="row mt-4">
          {savedArticleList.length === 0 ? (
            <div className="text-center w-100">
              <h4>You haven't saved any posts yet.</h4>
              <h5>Start reading now.</h5>
              <Link to="/posts" className="btn btn-primary m-3">
                Browse Posts
              </Link>
            </div>
          ) : (
            <div className="row">
              {savedArticleList.map((article) => (
                <CardComponent key={article.id} {...article} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
