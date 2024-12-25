import React, { useEffect, useState, useContext, useRef } from "react";
import supabase from "./utils/supabase";
import { SessionContext } from "./context/userSession.context";
import { Link } from "react-router-dom";

const CommentSection = ({ postId }) => {
    const session = useContext(SessionContext);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const userId = session?.user?.id;

    // Reference for the comment section to scroll to the top after adding a new comment
    const commentSectionRef = useRef(null);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const { data, error } = await supabase
                    .from("comment")
                    .select(`
                        id,
                        content,
                        created_at,
                        user:user_id (
                            id,
                            unique_user_name
                        )
                    `)
                    .eq("post_id", postId)
                    .order("created_at", { ascending: false }); // Fetch in descending order by created_at

                if (error) throw error;

                setComments(data);
            } catch (err) {
                console.error("Error fetching comments:", err.message);
            }
        };

        fetchComments();
    }, [postId]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("comment")
                .insert({
                    post_id: postId,
                    user_id: userId,
                    content: newComment.trim(),
                })
                .select(`
                    id,
                    content,
                    created_at,
                    user:user_id (
                        unique_user_name
                    )
                `)
                .single();

            if (error) throw error;

            // Add the new comment at the top of the existing list
            setComments((prev) => [data, ...prev]);
            setNewComment("");
        } catch (err) {
            console.error("Error adding comment:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Scroll to the top of the comment section whenever comments change
        if (commentSectionRef.current) {
            commentSectionRef.current.scrollTop = 0;
        }
    }, [comments]);

    return (
        <div className="d-flex flex-column h-100 bg-white border rounded">
            <div className="border-bottom p-3">
                <h5>
                    Comments<span className="mx-3 small text-muted">{comments.length}</span>
                </h5>
            </div>
            <div className="p-3 border-top">
                <textarea
                    className="form-control mb-2"
                    rows="2"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
                <button
                    className="btn btn-primary w-100"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || loading}
                >
                    {loading ? "Posting..." : "Post Comment"}
                </button>
            </div>
            <div
                className="flex-grow-1 overflow-auto p-3"
                ref={commentSectionRef}
                style={{ maxHeight: "50vh" }}
            >
                {comments.length === 0 ? (
                    <div className="text-center text-muted">
                        <p>No comments yet. Start the conversation.</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="mb-3 p-3 bg-white border rounded shadow-sm"
                        >
                            <p className="mb-1">{comment.content}</p>
                            <div className="text-muted small">
                                <Link
                                    to={`/user/${comment?.user?.id}`}
                                >
                                    @{comment.user?.unique_user_name || "Anonymous"}
                                </Link>
                                <span className="ms-2">
                                    {new Date(comment.created_at).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;
