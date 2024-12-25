import React from "react";
import NewPost from "../NewPost";

const NewPostPage = () => {
    return (
        <div className="container">
            <h3 className="text-center my-3">New Post</h3>
            <h5 className="text-center my-3">What's on you mind</h5>
            <NewPost />
        </div>
    )
}

export default NewPostPage;