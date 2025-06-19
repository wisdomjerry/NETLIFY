import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Admin login check
    if (username === "wisdom256" && password === "12345") {
      const adminUser = {
        username: "wisdom256",
        email: "wisdom.jeremiah.upti@gmail.com",
        password: "12345",
        name: "Wisdom", // ✅ Needed for banner icon
        isAdmin: true,
      };
      onLogin(adminUser); // ✅ This line is crucial
      localStorage.setItem("user", JSON.stringify(adminUser));
      navigate("/movies");
      return;
    }

    // ✅ Check normal user login
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const found = users.find(
      (u) =>
        (u.username === username || u.email === username) &&
        u.password === password
    );
    if (found) {
      onLogin(found); // ✅ Pass user to App
      localStorage.setItem("user", JSON.stringify(found));
      navigate("/movies");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-page">
      <div className="login-form">
        <div className="app-branding">
          <img src="/netflix-icon.svg" alt="Movie App Logo" className="logo" />
          <h1 className="app-name">NETLIFY</h1>
        </div>

        <div className="login-box">
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
            <button className="small-btn" type="submit">
              Login
            </button>
          </form>
          <p>
            Don't have an account?{" "}
            <a href="/signup" className="signup-link">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
