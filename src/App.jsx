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
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  // const [user, setUser] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    avatar: "",
  });

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
          <Route
            path="/"
            element={
              showSplash ? (
                <SplashScreen onComplete={handleSplashComplete} />
              ) : (
                <LandingPage />
              )
            }
          />

          <Route path="/" element={<LandingPage />} />
          <Route path="/" element={<LoginPage setUser={setUser} />} />

          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

          <Route path="/signup" element={<SignupForm />} />
          <Route
            path="/movies"
            element={user ? <MoviesPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </Router>
  );
}

export default App;
