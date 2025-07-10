import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SeriesDetail from "./components/SeriesDetail";
import EpisodeDetail from "./components/EpisodeDetail";
import MovieDetail from "./components/MovieDetail";

import SplashScreen from "./components/SplashScreen";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import SignupForm from "./components/SignupForm";
import AllMovies from "./components/allMovies";
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
            path="/movies"
            element={
              user ? (
                <AllMovies user={user} />
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
          {/* Add the IMDB Movies route below */}
          <Route path="/imdb" element={<AllMovies />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/series/:id" element={<SeriesDetail />} />
           <Route
          path="/series/:id/season/:seasonNumber/episode/:episodeNumber"
          element={<EpisodeDetail />}
        />
        </Routes>
      )}
    </Router>
  );
}

export default App;
