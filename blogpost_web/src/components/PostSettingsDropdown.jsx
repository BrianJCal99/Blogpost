import Dropdown from "react-bootstrap/Dropdown";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

const PostSettingsDropdown = ({ post_id, post_user_id }) => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isSaved, setIsSaved] = useState(false);

  // Fetch saved posts
  useEffect(() => {
    const checkIfSaved = async () => {
      const { data, error } = await supabase
        .from("save")
        .select("post_id")
        .eq("user_id", user?.id)
        .eq("post_id", post_id)
        .maybeSingle();

      if (error) {
        console.error("Error checking saved post:", error.message);
        return;
      }

      setIsSaved(!!data);
    };

    if (user?.id && post_id) checkIfSaved();
  }, [user?.id, post_id]);

  // Confirmation toast
  const confirmToast = (message) =>
    new Promise((resolve) => {
      toast(
        (t) => (
          <div style={{ minWidth: "250px" }}>
            <p className="mb-2">{message}</p>
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  resolve(true);
                  toast.dismiss(t.id);
                }}
              >
                Yes
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  resolve(false);
                  toast.dismiss(t.id);
                }}
              >
                No
              </button>
            </div>
          </div>
        ),
        { duration: Infinity },
      );
    });

  // Delete post
  const handleDelete = async () => {
    const confirmed = await confirmToast(
      "Are you sure you want to delete this post?",
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);

      const { error } = await supabase.from("post").delete().eq("id", post_id);
      if (error) throw error;

      toast.success("Post deleted successfully!");
      navigate("/myposts", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Save post
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const { error } = await supabase
        .from("save")
        .insert({ user_id: user?.id, post_id });

      if (error) throw error;
      setIsSaved(true);

      toast.success("Post saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error(
        err.message || "An unexpected error occurred while saving the post.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Unsave post
  const handleUnsave = async () => {
    try {
      setIsSaving(true);

      const { error } = await supabase
        .from("save")
        .delete()
        .eq("user_id", user?.id)
        .eq("post_id", post_id);

      if (error) throw error;
      setIsSaved(false);

      toast.success("Post removed from saved!");
    } catch (err) {
      console.error(err);
      toast.error(
        err.message || "An unexpected error occurred while removing the post.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dropdown>
      <Dropdown.Toggle
        as="button"
        bsPrefix="p-0 border-0 bg-transparent"
        className="text-dark"
      >
        <i className="bi bi-three-dots-vertical"></i>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {user?.id === post_user_id && (
          <>
            <Dropdown.Item
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
            >
              <i className="bi bi-trash3 me-2"></i>Delete
            </Dropdown.Item>

            <Dropdown.Item disabled={isDeleting || isSaving}>
              <i className="bi bi-eye-slash me-2"></i>Hide
            </Dropdown.Item>
          </>
        )}

        <Dropdown.Item
          onClick={isSaved ? handleUnsave : handleSave}
          disabled={isDeleting || isSaving}
        >
          <i
            className={`bi ${
              isSaved ? "bi-bookmark-fill" : "bi-bookmark"
            } me-2`}
          ></i>
          {isSaved ? "Unsave" : "Save"}
        </Dropdown.Item>

        <Dropdown.Item disabled={isDeleting || isSaving}>
          <i className="bi bi-share me-2"></i>Share
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/post/${post_id}`,
            );
            toast.success("Link copied!");
          }}
        >
          <i className="bi bi-link-45deg me-2"></i>
          Copy link
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default PostSettingsDropdown;
