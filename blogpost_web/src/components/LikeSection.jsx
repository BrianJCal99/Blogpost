import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import supabase from "../utils/supabase";
import toast from "react-hot-toast";

const LikeSection = ({ postId }) => {
    const { user } = useSelector((state) => state.user);
    const [likesCount, setLikesCount] = useState(0);
    const [userLiked, setUserLiked] = useState(false);
    const [showLikedBy, setShowLikedBy] = useState(false);
    const [likedBy, setLikedBy] = useState([]);

    useEffect(() => {
        const fetchLikesData = async () => {
            try {
                // Fetch the total number of likes
                const { data: likeData, error: likesError } = await supabase
                    .from("like")
                    .select("*", { count: "exact" })
                    .eq("post_id", postId);

                if (likesError) throw likesError;

                setLikesCount(likeData.length);

                // Check if the current user liked the post
                if (user?.id) {
                    const { data: userLikeData, error: userLikeError } = await supabase
                        .from("like")
                        .select("id")
                        .eq("post_id", postId)
                        .eq("user_id", user?.id)
                        .maybeSingle();

                    if (userLikeError && userLikeError.code !== "PGRST116") {
                        throw userLikeError;
                    }

                    setUserLiked(!!userLikeData);
                }
            } catch (error) {
                console.error("Error fetching like data:", error.message);
            }
        };

        fetchLikesData();
    }, [postId, user?.id]);

    const handleLike = async () => {
        if (!user?.id) {
            toast.error("You must be logged in to like a post.");
            // alert("You must be logged in to like a post.");
            return;
        }

        try {
            if (userLiked) {
                // Remove like
                const { error } = await supabase
                    .from("like")
                    .delete()
                    .eq("post_id", postId)
                    .eq("user_id", user?.id);

                if (error) throw error;

                toast("You unliked this post", {
                    icon: "👎",
                })
                setLikesCount((prev) => prev - 1);
                setUserLiked(false);
            } else {
                // Add like
                const { error } = await supabase
                    .from("like")
                    .insert({ post_id: postId, user_id: user?.id });

                if (error) throw error;

                toast("You liked this post", {
                    icon: "👍",
                })
                setLikesCount((prev) => prev + 1);
                setUserLiked(true);
            }
        } catch (error) {
            console.error("Error updating like:", error.message);
        }
    };

    const fetchLikers = async () => {
        try {
            const { data, error } = await supabase
                .from("like")
                .select("user_id, user(user_name)")
                .eq("post_id", postId);

            if (error) throw error;

            setLikedBy(data.map((like) => ({
                id: like.user_id,
                user_name: like.user.user_name,
            })));
        } catch (error) {
            console.error("Error fetching likedBy:", error.message);
        }
    };

    const handleShowLikedBy = async () => {
        if (!showLikedBy) {
            await fetchLikers();
        }
        setShowLikedBy((prev) => !prev);
    };

    return (
        <div className="d-flex flex-column align-items-start">
            <div className="d-flex align-items-center">
                <button
                    className="btn btn-lg border-0 text-primary"
                    onClick={handleLike}
                >
                    {userLiked ? <i className="bi bi-hand-thumbs-up-fill"></i> : <i className="bi bi-hand-thumbs-up"></i>}
                </button>
                <span
                    className="ml-2 text-primary"
                    style={{ cursor: "pointer" }}
                    onClick={handleShowLikedBy}
                >
                    {likesCount} {likesCount === 1 ? "Like" : "Likes"}
                </span>
            </div>

            {/* Render list of likedBy below the likes count */}
            {showLikedBy && likedBy.length > 0 && (
                <div className="list-group mt-2">
                    {likedBy.map((user) => (
                    <Link 
                        key={user.id} 
                        className="list-group-item"
                        to={`/user/${user.id}`}>
                        {user.user_name}
                    </Link>
                ))}
                </div>
            )}

            {/* Show message if no users have liked */}
            {showLikedBy && likedBy.length === 0 && (
                <p className="mt-2 text-muted">No likes yet.</p>
            )}
        </div>
    );
};

export default LikeSection;
