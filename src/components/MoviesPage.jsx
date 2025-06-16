import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaTachometerAlt,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./MoviesPage.css"; // custom styles for Netflix look

const heroMovies = [
  {
    title: "The Dark Knight",
    description: "A hero rises from the shadows to fight crime in Gotham City.",
    image: "/banner1.jpg",
  },
  {
    title: "Inception",
    description: "A skilled thief steals secrets through dream invasion.",
    image: "/banner2.jpg",
  },
  {
    title: "Stranger Things",
    description: "A group of kids uncover supernatural secrets in their town.",
    image: "/banner3.jpg",
  },
];

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroMovies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { title, description, image } = heroMovies[current];

  return (
    <div className="hero-banner" style={{ backgroundImage: `url(${image})` }}>
      <div className="hero-content">
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="hero-buttons">
          <button className="play-btn">▶ Play</button>
          <button className="info-btn">ℹ More Info</button>
        </div>
      </div>
    </div>
  );
};

const dummyMovies = [
  {
    src: "/movie1.jpg",
    title: "Interstellar",
    description: "A team travels through space to save humanity.",
    genre: "Sci-Fi",
  },
  {
    src: "/movie2.jpg",
    title: "The Matrix",
    description: "A hacker discovers the truth of his reality.",
    genre: "Action",
  },
  {
    src: "/movie3.jpg",
    title: "Inception",
    description: "Dreams become the battleground for secrets.",
    genre: "Thriller",
  },
  {
    src: "/movie4.jpg",
    title: "Joker",
    description: "A troubled man becomes Gotham's clown prince.",
    genre: "Drama",
  },
  {
    src: "/movie5.jpg",
    title: "Avengers",
    description: "Heroes unite to save the Earth.",
    genre: "Action",
  },
  {
    src: "/movie6.jpg",
    title: "Coco",
    description: "A boy enters the Land of the Dead.",
    genre: "Family",
  },
];

const Navbar = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Determine admin from user props
  const isAdmin =
    user?.username === "wisdom256" &&
    user?.email === "wisdom.jeremiah.upti@gmail.com" &&
    user?.password === "12345";

  const getColor = (char) => {
    const colors = [
      "#F59E0B",
      "#10B981",
      "#3B82F6",
      "#EC4899",
      "#8B5CF6",
      "#EF4444",
      "#14B8A6",
      "#6366F1",
      "#EAB308",
      "#F97316",
    ];
    return colors[char.charCodeAt(0) % colors.length];
  };

  const renderProfile = () => {
    const firstChar = user?.username?.charAt(0)?.toUpperCase() || "?";
    return (
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: getColor(firstChar),
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "1rem",
        }}
      >
        {firstChar}
      </div>
    );
  };

  return (
    <nav className="navbar">
      <h1 className="logo">NETLIFY</h1>

      <div
        className="profile-section"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{ cursor: "pointer" }}
      >
        {renderProfile()}

        {dropdownOpen && (
          <div className="dropdown-menu">
            <a href="/profile">
              <FaUser /> View Profile
            </a>
            <a href="/settings">
              <FaCog /> Settings
            </a>

            {isAdmin && (
              <a href="/admin">
                <FaTachometerAlt /> Admin Dashboard
              </a>
            )}

            <a href="/logout">
              <FaSignOutAlt /> Logout
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

const MoviesPage = ({ user }) => {
  const [genre, setGenre] = useState("All");
  const [language, setLanguage] = useState("All");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const navigate = useNavigate();

  // This will only show the admin dashboard link for the admin user
  const isDeveloper =
    user.email === "wisdom.jeremiah.upti@gmail.com" &&
    user.password === "12345";

  // Get the first letter of the current user's username, fallback to "?"
  const firstLetter = user?.username?.charAt(0)?.toUpperCase() || "?";

  // Logout handler
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Filter movies by search and genre/language
  const filteredMovies = dummyMovies.filter(
    (movie) =>
      (genre === "All" || movie.genre === genre) &&
      (language === "All" || !movie.language || movie.language === language) &&
      movie.title.toLowerCase().includes(search.toLowerCase())
  );

  // Mobile taskbar navigation
  const handleMobileNav = (route) => {
    navigate(route);
  };

  return (
    <div className="movies-page">
      {/* Top Right Profile */}
      <div
        className="top-profile"
        style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 50 }}
      >
        <div
          className="avatar"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          style={{
            backgroundColor: "#333",
            color: "#fff",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1.2rem",
          }}
        >
          {firstLetter}
        </div>

        {showProfileMenu && (
          <div
            className="profile-dropdown"
            style={{
              backgroundColor: "#222",
              color: "#fff",
              position: "absolute",
              top: "50px",
              right: "0",
              padding: "10px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              zIndex: 50,
            }}
          >
            <a
              href="/profile"
              style={{ display: "block", marginBottom: "8px" }}
            >
              <FaUser /> Profile
            </a>
            <a
              href="/settings"
              style={{ display: "block", marginBottom: "8px" }}
            >
              <FaCog /> Settings
            </a>
            {isDeveloper && (
              <a
                href="/admin"
                style={{ display: "block", marginBottom: "8px" }}
              >
                <FaTachometerAlt /> Admin Dashboard
              </a>
            )}
            <a href="#" onClick={handleLogout} style={{ display: "block" }}>
              <FaSignOutAlt /> Logout
            </a>
          </div>
        )}
      </div>

      <Navbar user={user} />

      <HeroBanner />

      {/* Responsive & Creative Search Bar */}
      <div
        className="search-bar-container"
        style={{
          display: "flex",
          justifyContent: "center",
          margin: "2rem 0 1rem 0",
        }}
      >
        <div
          className={`search-bar${searchFocus ? " focused" : ""}`}
          style={{
            display: "flex",
            alignItems: "center",
            background: "#222",
            borderRadius: "2rem",
            padding: "0.5rem 1rem",
            boxShadow: searchFocus ? "0 2px 12px rgba(0,0,0,0.2)" : "none",
            transition: "box-shadow 0.3s, width 0.3s",
            width: searchFocus ? "350px" : "220px",
            maxWidth: "90vw",
          }}
        >
          <FaSearch style={{ color: "#888", marginRight: "0.5rem" }} />
          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              color: "#fff",
              fontSize: "1rem",
              width: "100%",
            }}
          />
        </div>
      </div>

      <div className="filters">
        <select
          onChange={(e) => setGenre(e.target.value)}
          value={genre}
          className="filter-select"
        >
          <option value="All">All Genres</option>
          <option value="Action">Action</option>
          <option value="Drama">Drama</option>
          <option value="Sci-Fi">Sci-Fi</option>
          <option value="Comedy">Comedy</option>
          <option value="Thriller">Thriller</option>
        </select>

        <select
          onChange={(e) => setLanguage(e.target.value)}
          value={language}
          className="filter-select"
        >
          <option value="All">All Languages</option>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="Hindi">Hindi</option>
        </select>
      </div>

      {/* Movie Section using filteredMovies */}
      <div className="movie-section">
        <h2 className="section-title">All Movies</h2>
        <div className="movie-row">
          {filteredMovies.length === 0 ? (
            <p style={{ color: "#fff", textAlign: "center", width: "100%" }}>
              No movies found.
            </p>
          ) : (
            filteredMovies.map((movie, idx) => (
              <div key={idx} className="movie-card">
                <img
                  src={movie.src}
                  alt={movie.title}
                  className="movie-image"
                />
                <div className="movie-info">
                  <h4>{movie.title}</h4>
                  <p className="movie-genre">{movie.genre}</p>
                  <p className="movie-desc">{movie.description}</p>
                  <button
                    className="add-btn"
                    // ...add to my list logic...
                  >
                    + Add to My List
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Taskbar */}
      <div
        className="mobile-taskbar"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "#181818",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "0.5rem 0",
          zIndex: 100,
          borderTop: "1px solid #222",
        }}
      >
        <button
          onClick={() => handleMobileNav("/movies")}
          style={{ background: "none", border: "none", color: "#fff", flex: 1 }}
        >
          <span role="img" aria-label="home" style={{ fontSize: "1.5rem" }}>
            🏠
          </span>
          <p style={{ margin: 0, fontSize: "0.8rem" }}>Home</p>
        </button>
        <button
          onClick={() => handleMobileNav("/imdb")}
          style={{ background: "none", border: "none", color: "#fff", flex: 1 }}
        >
          <span role="img" aria-label="search" style={{ fontSize: "1.5rem" }}>
            🔍
          </span>
          <p style={{ margin: 0, fontSize: "0.8rem" }}>Search</p>
        </button>
        <button
          onClick={() => handleMobileNav("/watchlist")}
          style={{ background: "none", border: "none", color: "#fff", flex: 1 }}
        >
          <span
            role="img"
            aria-label="watchlist"
            style={{ fontSize: "1.5rem" }}
          >
            📄
          </span>
          <p style={{ margin: 0, fontSize: "0.8rem" }}>Watchlist</p>
        </button>
        <button
          onClick={() => handleMobileNav("/downloads")}
          style={{ background: "none", border: "none", color: "#fff", flex: 1 }}
        >
          <span
            role="img"
            aria-label="downloads"
            style={{ fontSize: "1.5rem" }}
          >
            ⬇️
          </span>
          <p style={{ margin: 0, fontSize: "0.8rem" }}>Downloads</p>
        </button>
      </div>
    </div>
  );
};

export default MoviesPage;
