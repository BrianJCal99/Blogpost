import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SessionContext } from "./context/userSession.context";

const ProtectedRoute = ({ children }) => {
  const session = useContext(SessionContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading or perform any necessary checks for session validation
    if (session !== undefined) {
      setLoading(false);
    }
  }, [session]);

  if (loading) {
    // Show a loading message or spinner while the session is being checked
    return (
      <div className="container text-center my-3">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Checking session...</p>
      </div>
    );
  }

  if (!session) {
    // Show sign-in message if there is no session
    return (
      <div className="container text-center my-3">
        <div className="alert alert-primary m-3" role="alert">
          Please{" "}
          <Link to="/signin" className="btn btn-primary m-3">
            Sign in
          </Link>
          to continue.
        </div>
      </div>
    );
  }

  // If the session exists, render the protected content
  return children;
};

export default ProtectedRoute;
