import { Navigate, useLocation, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { signOutUser, resetError } from "../redux/features/user/userSlice";
import toast from "react-hot-toast";

const Navbar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Handlers
  const handleSignOut = async () => {
    try {
      dispatch(resetError());
      const result = await dispatch(signOutUser());
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("You have successfully signed out!");
        return <Navigate to="/signin" state={{ from: location }} replace />;
      }
    } catch (err) {
      console.error("Sign-out error: ", err);
      toast.error(err.message);
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-5">
        <Link to="/" className="navbar-brand mx-3 m-3">
          BLOGPOST
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li
              className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
            >
              <Link to="/" className="nav-link mx-3 m-3">
                Home
              </Link>
            </li>
            <li
              className={`nav-item ${location.pathname === "/allposts" ? "active" : ""}`}
            >
              <Link to="/posts" className="nav-link mx-3 m-3">
                Posts
              </Link>
            </li>
            <li
              className={`nav-item ${location.pathname === "/alltags" ? "active" : ""}`}
            >
              <Link to="/tags" className="nav-link mx-3 m-3">
                #tags
              </Link>
            </li>
            <li
              className={`nav-item ${location.pathname === "/search" ? "active" : ""}`}
            >
              <Link to="/search" className="nav-link mx-3 m-3">
                Search
              </Link>
            </li>
            {user ? (
              <li className="nav-item dropdown">
                <div
                  className="nav-link text-uppercase text-primary font-weight-bold dropdown-toggle m-3"
                  id="navbarDropdown"
                  role="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  Hi, {user?.user_metadata?.firstName || user?.email || "User"}
                </div>
                <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <Link to="/myprofile" className="dropdown-item">
                    My Profile
                  </Link>
                  <Link to="/myposts" className="dropdown-item">
                    My Posts
                  </Link>
                  <Link to="/newpost" className="dropdown-item">
                    New Post
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={handleSignOut}>
                    Sign out
                  </button>
                </div>
              </li>
            ) : (
              <div className="d-flex">
                <li className="nav-item mx-3 m-3">
                  <Link
                    to="/signin"
                    className={`nav-link ${location.pathname === "/signin" ? "active" : ""}`}
                  >
                    Sign in
                  </Link>
                </li>
                <li className="nav-item mx-3 m-3">
                  <Link
                    to="/signup"
                    className={`nav-link ${location.pathname === "/signup" ? "active" : ""}`}
                  >
                    Sign up
                  </Link>
                </li>
              </div>
            )}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
