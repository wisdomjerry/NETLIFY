import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- added this import

const SignupForm = () => {
  const navigate = useNavigate(); //<--   

    
  const [form, setForm] = useState({
    name: "", // <--   
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  
  const handleSubmit = (e) => {
    e.preventDefault();

    // Save user to localStorage
    localStorage.setItem("user", JSON.stringify(form));

    // Optionally, add to a users array for admin viewing
    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.push({ ...form, joined: new Date().toISOString(), active: true });
    localStorage.setItem("users", JSON.stringify(users));

    console.log("User submitted:", form);

    
    navigate("/login");
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
        <h2 className="gradient-text">Create an Account</h2>

        <input
          name="name" // <-- added this input
          placeholder="Full Name"
          onChange={handleChange}
          required
        />

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
