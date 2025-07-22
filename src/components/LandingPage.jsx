// src/components/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import Auth from "./Auth"; // ✅ Import Auth component
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing-container">
      <img
        src="/pelikula.jfif"
        alt="Pelikula Logo"
        className="pelikula-logo"
      />
      <h1 className="landing-title">Welcome to Pelikula</h1>

      {/* ✅ Google Sign-in & User display */}
      <div style={{ marginBottom: "1rem" }}>
        <Auth />
      </div>

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
