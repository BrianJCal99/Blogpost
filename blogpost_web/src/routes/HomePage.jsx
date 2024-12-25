import React from 'react';
import { Link } from 'react-router-dom';
import PostList from '../PostList.jsx';
import TagList from '../TagList.jsx';
import UserList from '../UserList.jsx';
import Header from '../Header.jsx';

function HomePage() {
    return (
        <div>
            <Header />
            <div className="container">
                <div className="row">
                    <div className="col text-center my-4">
                        <h1>Featured Posts</h1>
                    </div>
                    <div>
                        <PostList limit={3}/>
                    </div>
                    <div className="col text-center m-4">
                        <Link to='/posts' type="button" className="btn btn-dark m-4">See all posts</Link>
                    </div>
                </div>
                <div className="row">
                    <div className="col text-center my-4">
                        <h1>Featured Bloggers</h1>
                    </div>
                    <div>
                        <UserList limit={3}/>
                    </div>
                    <div className="col text-center m-4">
                        <Link to='/users' type="button" className="btn btn-dark m-4">See all bloggers</Link>
                    </div>
                </div>
                <div className="row">
                    <div className="col text-center my-4">
                        <h1>Featured #hashtags</h1>
                    </div>
                    <div>
                        <TagList limit={3}/>
                    </div>
                    <div className="col text-center m-4">
                        <Link to='/tags' type="button" className="btn btn-dark m-4">See all hashtags</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;