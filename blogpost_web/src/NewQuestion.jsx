import React from "react";

function NewQuestion() {
    return (
        <div>
            <form>
                <div className="form-group m-3">
                    <label for="title">Title: </label>
                    <input type="text" className="form-control" id="title" placeholder="Start your question with how, what, why, etc."/>
                </div>
                <div className="form-group m-3">
                    <label for="decription">Describe your problem </label>
                    <textarea className="form-control" id="decription"></textarea>
                </div>
                <div className="form-group m-3">
                    <label for="title">Tags: </label>
                    <input type="text" className="form-control" id="title" placeholder="Please add up to 3 tags to describe what your question is about e.g., Java"/>
                </div>
                <button type="submit" className="btn btn-primary mt-3 mb-3">Post</button>
            </form>
        </div>
    )
}

export default NewQuestion;