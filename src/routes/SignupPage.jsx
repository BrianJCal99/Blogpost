import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signUpUser, resetError } from "../redux/features/user/userSlice";
import Input from "../components/Input";
import toast from "react-hot-toast";

const SignupPage = (props) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    uniqueUserName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state) => state.user);
  const [isClient, setIsClient] = useState(false);

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
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      dispatch(resetError()); // Reset any previous error state

      // Dispatch the sign-in action and wait for the result
      const result = await dispatch(
        signUpUser({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          userName: formData.userName,
          uniqueUserName: formData.uniqueUserName,
        }),
      );
      if (result.meta.requestStatus === "fulfilled") {
        // alert("Signup successful!");
        toast.success("You have successfully signed up!");
        // Redirect to the main page
        navigate("/");
      } else {
        // alert("Signup un-successful!");
        toast.error("Signup un-successful!");
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
        <h5 className="m-5">Create a BLOGPOST Account</h5>

        <form onSubmit={handleSubmit}>
          <Input
            name="firstName"
            type="text"
            placeholder="first name"
            onChange={handleChange}
            value={formData.firstName}
          />

          <Input
            name="lastName"
            type="text"
            placeholder="last name"
            onChange={handleChange}
            value={formData.lastName}
          />

          <Input
            name="userName"
            type="text"
            placeholder="pick any username"
            onChange={handleChange}
            value={formData.userName}
          />

          <Input
            name="uniqueUserName"
            type="text"
            placeholder="pick a unique username"
            onChange={handleChange}
            value={formData.uniqueUserName}
          />

          <Input
            name="email"
            type="email"
            placeholder="email"
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

          <Input
            name="confirmPassword"
            type="password"
            placeholder="confirm password"
            onChange={handleChange}
            value={formData.confirmPassword}
          />

          <div className="text-center">
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn btn-primary btn-block mb-4"
            >
              Sign up
            </button>
          </div>
        </form>

        {status === "failed" && error && error !== "Auth session missing!" && (
          <p className="mt-4 text-center small text-danger">{error}</p>
        )}

        <div className="text-center">
          <p>
            Already have an account? <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
