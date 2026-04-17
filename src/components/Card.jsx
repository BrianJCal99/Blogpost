import { useNavigate } from "react-router-dom";

const Card = (post) => {
  const navigate = useNavigate();

  const handleViewPostClick = () => {
    navigate(`/post/${post.post_id}`); // Navigate to the details page with the item's ID
  };

  const handleUsernameClick = (e) => {
    e.stopPropagation();
    navigate(`/user/${post.post_user_id}`); // Navigate to the details page with the item's ID
  };

  return (
    <div className="col-lg-4 d-flex justify-content-center my-3">
      <div className="card" style={{ width: "24rem" }}>
        {/* Display the image if image_url is provided */}
        {post.image_url ? (
          <img
            src={post.image_url}
            className="card-img-top"
            alt={post.title}
            style={{ height: "200px", objectFit: "cover", cursor: "pointer" }}
            onClick={handleViewPostClick}
          />
        ) : (
          <img
            src="/BLOGPOST_card_image_bootstrap_primary.png"
            className="card-img-top"
            alt={post.title}
            style={{ height: "200px", objectFit: "cover", cursor: "pointer" }}
            onClick={handleViewPostClick}
          />
        )}
        <div className="card-body">
          <h5 className="card-title">{post.title}</h5>
          <h6 className="card-subtitle mb-2 text-muted">{post.abstract}</h6>
          <div
            onClick={handleUsernameClick}
            className="card-text small text-muted"
            style={{ cursor: "pointer" }}
          >
            @{post.post_user}
          </div>
          <p className="card-text small text-muted">{post.date}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
