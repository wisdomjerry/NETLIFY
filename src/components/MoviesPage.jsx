import React, { useEffect, useState, useRef } from "react";
import { FaUser, FaCog, FaSignOutAlt, FaTachometerAlt } from "react-icons/fa";

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

const Section = ({ title }) => {
  const [scrollPos, setScrollPos] = useState(0);
  const [myList, setMyList] = useState(() => {
    const saved = localStorage.getItem("myMovieList");
    return saved ? JSON.parse(saved) : [];
  });

  const rowRef = useRef(null);

  const scroll = (direction) => {
    const scrollAmount = 300;
    if (rowRef.current) {
      const newPos =
        direction === "left"
          ? scrollPos - scrollAmount
          : scrollPos + scrollAmount;
      rowRef.current.scrollTo({ left: newPos, behavior: "smooth" });
      setScrollPos(newPos);
    }
  };

  const addToMyList = (movie) => {
    if (myList.find((m) => m.title === movie.title)) return;
    const updatedList = [...myList, movie];
    setMyList(updatedList);
    localStorage.setItem("myMovieList", JSON.stringify(updatedList));
  };

  return (
    <div className="movie-section">
      <h2 className="section-title">{title}</h2>
      <div className="scroll-buttons">
        <button onClick={() => scroll("left")}>&lt;</button>
        <button onClick={() => scroll("right")}>&gt;</button>
      </div>
      <div className="movie-row" ref={rowRef}>
        {dummyMovies.map((movie, idx) => (
          <div key={idx} className="movie-card">
            <img src={movie.src} alt={movie.title} className="movie-image" />
            <div className="movie-info">
              <h4>{movie.title}</h4>
              <p className="movie-genre">{movie.genre}</p>
              <p className="movie-desc">{movie.description}</p>
              <button
                className="add-btn"
                onClick={() => addToMyList(movie)}
                disabled={myList.find((m) => m.title === movie.title)}
              >
                {myList.find((m) => m.title === movie.title)
                  ? "Added"
                  : "+ Add to My List"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
  // Inside Navbar component
};



const MoviesPage = ({ user }) => {
  const [genre, setGenre] = useState("All");
  const [language, setLanguage] = useState("All");


// Simulated logged-in user (for development/testing)
 


  
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isDeveloper =
    user.email === "wisdom.jeremiah.upti@gmail.com" &&
    user.password === "12345";

  return (
    <div className="movies-page">
      {/* Top Right Profile */}
      <div className="top-profile" style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 50 }}>
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
          }}
        >
          {user?.username?.charAt(0).toUpperCase()}
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
            <a href="/profile" style={{ display: "block", marginBottom: "8px" }}>
              <FaUser /> Profile
            </a>
            <a href="/settings" style={{ display: "block", marginBottom: "8px" }}>
              <FaCog /> Settings
            </a>
            {isDeveloper && (
              <a href="/admin" style={{ display: "block", marginBottom: "8px" }}>
                <FaTachometerAlt /> Admin Dashboard
              </a>
            )}
            <a href="/logout" style={{ display: "block" }}>
              <FaSignOutAlt /> Logout
            </a>
          </div>
        )}
      </div>

      <Navbar user={user} />

      <HeroBanner />

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

      <Section title="Trending Now" />
      <Section title="Popular on Netlify" />
      <Section title="Top Picks For You" />
      <Section title="Action Movies" />

      <div className="mobile-taskbar">
        <button>
          <span role="img" aria-label="home">🏠</span>
          <p>Home</p>
        </button>
        <button>
          <span role="img" aria-label="search">🔍</span>
          <p>Search</p>
        </button>
        <button>
          <span role="img" aria-label="watchlist">📄</span>
          <p>Watchlist</p>
        </button>
        <button>
          <span role="img" aria-label="downloads">⬇️</span>
          <p>Downloads</p>
        </button>
      </div>
    </div>
  );
};

export default MoviesPage;
