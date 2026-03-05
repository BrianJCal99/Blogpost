import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { signInUser, resetError } from "../redux/features/user/userSlice";

const SigninPage = (props) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isClient, setIsClient] = useState(false);

  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state) => state.user);

  useEffect(() => {
    setIsClient(true);
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(resetError()); // Reset any previous error state

      // Dispatch the sign-in action and wait for the result
      const result = await dispatch(
        signInUser({
          email: formData.email,
          password: formData.password,
        }),
      );

      if (result.meta.requestStatus === "fulfilled") {
        // alert("Sign in successful!");
        toast.success("You have successfully signed in!");
        // Redirect to the main page
        navigate("/");
      } else {
        // alert("Sign in un-successful!");
        toast.error("Sign in un-successful!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="p-4 d-flex justify-content-center pb-4">
      <div>
        <h5 className="m-5">Sign in to your BLOGPOST Account</h5>

        <form onSubmit={handleSubmit}>
          <Input
            name="email"
            type="text"
            placeholder="username/email"
            onChange={handleChange}
            value={formData.email}
          />

          <Input
            name="password"
            type="password"
            placeholder="password"
            onChange={handleChange}
            value={formData.password}
          />

          <div className="text-center">
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn btn-primary btn-block mb-4"
            >
              {status === "loading" ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        {status === "failed" && error && error !== "Auth session missing!" && (
          <p className="mt-4 text-center small text-danger">{error}</p>
        )}

        <div className="text-center">
          <p>
            Not a member? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default SigninPage;
