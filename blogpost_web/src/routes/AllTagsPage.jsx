import React from "react";
import TagList from "../TagList";

const AllTagsPage = () => {
    return (
        <div className="container">
            <div className="row">
                <div className="col text-center">
                    <h1 className='text-center'>All #hashtags</h1>
                </div>
                <TagList />
            </div>

        </div>
    );
};

export default AllTagsPage;