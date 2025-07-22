import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


import SplashScreen from "./components/SplashScreen";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import SignupForm from "./components/SignupForm";
import MediaGallery from "./components/MediaGallery"; // Renamed import alias from AllMovies to MediaGallery
import SeriesDetail from "./components/SeriesDetail";
import EpisodeDetail from "./components/EpisodeDetail";
import MovieDetail from "./components/MovieDetail";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AnalyticsPage from "./components/AnalyticsPage";
import UsersPage from "./components/UsersPage";

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !localStorage.getItem("splashShown");
  });

  // Use null for unauthenticated user
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <Router>
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route
            path="/movies" // This route will now display the combined MediaGallery
            element={
              user ? (
                <MediaGallery user={user} /> // Use MediaGallery here
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/users" element={<UsersPage />} />
          {/* The /imdb route also points to the MediaGallery now */}
          <Route path="/imdb" element={<MediaGallery />} />
          {/* Existing detail routes for movies, series, and episodes */}
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/tv/:id" element={<SeriesDetail />} /> {/* Changed from /series/:id to /tv/:id to match MediaGallery's dynamic linking */}
          <Route
            path="/tv/:id/season/:seasonNumber/episode/:episodeNumber" // Changed from /series to /tv
            element={<EpisodeDetail />}
          />
        </Routes>
      )}
    </Router>
  );
}

export default App;
