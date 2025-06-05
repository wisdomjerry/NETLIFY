// src/components/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css"; 

function LandingPage() {
  return (
    <div className="landing-container">
      <img
        src="/netflix-icon.svg"
        alt="Netflix Logo"
        className="netflix-logo"
      />
      <h1 className="landing-title">Welcome to Netlify</h1>

      <div className="landing-buttons">
        <Link to="/login" className="btn-login">
          Log In
        </Link>
        <Link to="/signup" className="btn-signup">
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
