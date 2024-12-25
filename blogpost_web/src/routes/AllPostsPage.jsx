import React from "react";
import PostList from "../PostList";

const AllPostsPage = () => {
    return (
        <div className="container">
            <div className="row">
                <div className="col">
                    <h2 className="text-center my-3">All Posts</h2>
                    <PostList />
                </div>
            </div>
        </div>
    )
}

export default AllPostsPage;