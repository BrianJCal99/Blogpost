import React from "react";
import { useNavigate } from "react-router-dom";
import PostSettingsDropdown from "./PostSettingsDropdown";

const Card = (props) => {
  const navigate = useNavigate();

  const handleViewPostClick = () => {
    navigate(`/post/${props.post_id}`); // Navigate to the details page with the item's ID
  };

  const handleUsernameClick = (e) => {
    e.stopPropagation();
    navigate(`/user/${props.post_user_id}`); // Navigate to the details page with the item's ID
  };

  return (
    <div className="col-lg-4 d-flex justify-content-center my-3">
      <div
        className="card"
        style={{ width: "24rem", cursor: "pointer" }}
        onClick={handleViewPostClick}
      >
        {/* Display the image if image_url is provided */}
        {props.image_url ? (
          <img
            src={props.image_url}
            className="card-img-top"
            alt={props.title}
            style={{ height: "200px", objectFit: "cover" }}
          />
        ) : (
          <img
            src="/BLOGPOST_card_image_bootstrap_primary.png"
            className="card-img-top"
            alt={props.title}
            style={{ height: "200px", objectFit: "cover" }}
          />
        )}
        <div className="card-body">
          <h5 className="card-title">{props.title}</h5>
          <h6 className="card-subtitle mb-2 text-muted">{props.abstract}</h6>
          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={handleUsernameClick}
          >
            @{props.post_user}
          </button>
          <p className="small text-muted">{props.date}</p>
        </div>
        <div
          className="card-footer bg-white d-flex justify-content-end"
          onClick={(e) => e.stopPropagation()}
        >
          <PostSettingsDropdown
            post_id={props.post_id}
            post_user_id={props.post_user_id}
          />
        </div>
      </div>
    </div>
  );
};

export default Card;
