import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- added this import

const SignupForm = () => {
  const navigate = useNavigate(); // <-- added this line

  // This creates a "state" to keep track of what the user types in the form
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  // This runs whenever the user types something in an input field
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // This runs when the user submits the form (clicks Sign Up)
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("User submitted:", form);

    // Redirect to /movies after signup
    navigate("/movies");
  };

  const handleGoogleLogin = () => {
    alert("Google login clicked! (this part not done yet)");
  };

  return (
    <div className="signup-container">
      <div className="app-branding">
        <img src="/netflix-icon.svg" alt="Movie App Logo" className="logo" />
        <h1 className="app-name">NETLIFY</h1>
      </div>
      <form onSubmit={handleSubmit} className="signup-form">
        <h2 class="gradient-text">Create an Account</h2>

        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <button type="submit">Sign Up</button>
        <div className="alternative-login">
          <p>
            Already have an account?{" "}
            <a href="/login" className="login-link">
              Login
            </a>
          </p>

          <button
            onClick={handleGoogleLogin}
            className="google-login-btn"
            type="button"
          >
            Continue with Google
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
