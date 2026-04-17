import React from "react";
import "./header.css"; // Import the CSS file for styling

const Header = () => {
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col header-background">
                    <h1 className="header-text">Welcome to BLOGPOST</h1>
                    <p className="slogan-text">Let's start blogging</p>
                </div>
            </div>
        </div>
    )
}

export default Header;