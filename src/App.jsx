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
import MoviesPage from "./components/MoviesPage";
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
                <MoviesPage user={user} />
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
        </Routes>
      )}
    </Router>
  );
}

export default App;
