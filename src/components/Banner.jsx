import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Banner = ({ user: propUser }) => {
  const [movies, setMovies] = useState([]);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(propUser || null);
  const navigate = useNavigate();
  const dropdownRef = useRef();
  const apiKey = "688fd03556ed51e7944c50c4783c6023";

  // Load user from localStorage
  useEffect(() => {
    if (!propUser) {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser) {
        setUser(savedUser);
        console.log("User loaded:", savedUser);
      }
    }
  }, [propUser]);

  // Fetch movies
  useEffect(() => {
    const fetchNewestMovies = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&page=1`
      );
      const data = await res.json();
      setMovies(data.results.slice(0, 4));
    };
    fetchNewestMovies();
  }, []);

  // Handle fade animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % 4);
        setFade(true);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Admin check
  const isAdmin =
    user?.username === "wisdom256" &&
    user?.email === "wisdom.jeremiah.upti@gmail.com" &&
    user?.password === "12345";

  // Get first letter of user
  const getFirstLetter = () => {
    if (!user) return null;
    if (user.name && typeof user.name === "string") return user.name.charAt(0).toUpperCase();
    if (user.username && typeof user.username === "string") return user.username.charAt(0).toUpperCase();
    return "U";
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen((prev) => !prev);
  };

  const handleMenuClick = (e, path) => {
    e.stopPropagation();
    navigate(path);
    setDropdownOpen(false);
  };

  const handleLogout = (e) => {
    e.stopPropagation();
    localStorage.removeItem("user");
    alert("Logged out successfully.");
    navigate("/login");
    setDropdownOpen(false);
  };

  const movie = movies[index];
  const firstLetter = getFirstLetter();

  return movie ? (
    <div
      onClick={() => setDropdownOpen(false)}
      style={{
        ...styles.bannerWrapper,
        backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
        opacity: fade ? 1 : 0,
        transition: "opacity 0.6s ease-in-out",
      }}
      onDoubleClick={() => navigate(`/movie/${movie.id}`)}
    >
      <div style={styles.overlay}>
        <div style={styles.content}>
          <h1 style={styles.title}>{movie.title}</h1>
          <p style={styles.overview}>{movie.overview?.substring(0, 200)}...</p>
        </div>

        {/* Profile Icon */}
        {user && (
          <div style={styles.profileContainer} ref={dropdownRef}>
            <div style={styles.profileCircle} onClick={toggleDropdown}>
              {firstLetter}
              {dropdownOpen && (
                <div style={styles.dropdown}>
                  <button onClick={(e) => handleMenuClick(e, "/profile")}>
                    👤 Profile
                  </button>
                  {isAdmin && (
                    <button onClick={(e) => handleMenuClick(e, "/admin")}>
                      ⚙️ Admin Dashboard
                    </button>
                  )}
                  <button onClick={handleLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <p style={{ color: "#fff", textAlign: "center", backgroundColor: "#000" }}>
      Loading banner...
    </p>
  );
};

// Styling
const styles = {
  bannerWrapper: {
    height: "70vh",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    width: "100%",
    zIndex: 1,
  },
  overlay: {
    height: "100%",
    width: "100%",
    display: "flex",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flexDirection: "column",
    justifyContent: "center",
  },
  content: {
    maxWidth: "700px",
    color: "#fff",
    textAlign: "center",
    margin: "auto",
    top: "50%",
    transform: "translateY(50%)",
    padding: "1rem",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
  },
  overview: {
    fontSize: "1.2rem",
    color: "#ddd",
  },
  profileContainer: {
    position: "absolute",
    top: "20px",
    right: "20px",
  },
  profileCircle: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#00d8ff",
    color: "#121212",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
    fontSize: "1.2rem",
  },
  dropdown: {
    position: "absolute",
    top: "50px",
    right: "0",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderRadius: "6px",
    padding: "0.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    zIndex: 100,
    boxShadow: "0 0 10px rgba(0,0,0,0.4)",
  },
};

export default Banner;
