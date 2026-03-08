import Dropdown from "react-bootstrap/Dropdown";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";
import toast from "react-hot-toast";
import { useState } from "react";

const PostSettingsDropdown = ({ post_id, post_user_id }) => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper: show confirmation toast
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
      navigate("/myposts", { replace: true }); // React-friendly navigation
    } catch (err) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
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
            <Dropdown.Item onClick={handleDelete} disabled={isDeleting}>
              <i className="bi bi-trash3 me-2"></i>Delete
            </Dropdown.Item>
            <Dropdown.Item disabled={isDeleting}>
              <i className="bi bi-eye-slash me-2"></i>Hide
            </Dropdown.Item>
          </>
        )}
        <Dropdown.Item disabled={isDeleting}>
          <i className="bi bi-bookmark me-2"></i>Save
        </Dropdown.Item>
        <Dropdown.Item disabled={isDeleting}>
          <i className="bi bi-share me-2"></i>Share
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default PostSettingsDropdown;
