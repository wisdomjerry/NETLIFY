import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const LoginPage = ({ setUser }) => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    setUser({
      username: "Wisdom",
      email,
      password,
      avatar: "https://your-avatar-url.com",
    });

    navigate("/movies"); // redirect after login
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple mock validation:
    if (username === "wisdom256" && password === "12345") {
      onLogin({
        username,
        email: "wisdom.jeremiah.upti@gmail.com",
        password,
        name: "Wisdom",
      });
      navigate("/movies"); // redirect after login
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-page">
      <div class className="login-form">
        <div className="app-branding">
          <img src="/netflix-icon.svg" alt="Movie App Logo" className="logo" />
          <h1 className="app-name">NETLIFY</h1>
        </div>
        <div class="login-box">
          <h2 className="gradient-text">Login to Your Account</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <label>
              Username or Email:
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
            <label>
              Password:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button class="small-btn" type="submit">
              Login
            </button>
          </form>
          <p>
            Don't have an account?{" "}
            <a href="/signup" class="signup-link">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
