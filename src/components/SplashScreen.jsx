import React, { useEffect, useState } from "react";
import "./SplashScreen.css";

function SplashScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => onComplete(), 1000); // match fade duration
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`splash-screen ${fadeOut ? "fade-out" : ""}`}>
      <video
        className="splash-video"
        src="/splash-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="splash-overlay">
        <img src="/netflix-icon.svg" alt="NETLIFY Logo" className="splash-logo" />
        <h1 className="splash-title">NETLIFY</h1>
      </div>
    </div>
  );
}

export default SplashScreen;
