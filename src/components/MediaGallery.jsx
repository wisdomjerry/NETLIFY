import React, { useEffect, useState } from "react";
import Banner from "./Banner"; // Assuming Banner component exists
import { Link } from "react-router-dom";
import { Film, Tv } from "lucide-react"; // Import icons for movies and TV

const TMDB_API_KEY = "688fd03556ed51e7944c50c4783c6023";

const MediaGallery = ({ user }) => {
  const [mediaType, setMediaType] = useState('movie'); // 'movie' or 'tv'
  const [mediaItems, setMediaItems] = useState([]); // Stores either movies or TV series
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [movieGenres, setMovieGenres] = useState([]); // Separate genres for movies
  const [tvGenres, setTvGenres] = useState([]);     // Separate genres for TV
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch genres for both movies and TV series on load
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const movieGenresRes = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`);
        const movieGenresData = await movieGenresRes.json();
        setMovieGenres(movieGenresData.genres);

        const tvGenresRes = await fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}`);
        const tvGenresData = await tvGenresRes.json();
        setTvGenres(tvGenresData.genres);
      } catch (err) {
        console.error("Error fetching genres:", err);
        setError("Failed to load genres.");
      }
    };
    fetchGenres();
  }, []);

  // Fetch media items (movies or TV series) based on current filters
  useEffect(() => {
    const fetchMediaItems = async () => {
      setLoading(true);
      setError(null);
      let url = "";
      const base = "https://api.themoviedb.org/3";
      const currentYear = new Date().getFullYear();

      try {
        if (mediaType === 'movie') {
          if (searchTerm) {
            url = `${base}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}&page=${page}`;
          } else {
            url = `${base}/discover/movie?api_key=${TMDB_API_KEY}&page=${page}`;
            if (selectedGenre) url += `&with_genres=${selectedGenre}`;
            if (selectedYear) url += `&primary_release_year=${selectedYear}`;
            else url += `&primary_release_year.lte=${currentYear}`; // Default to current year or earlier if no year selected
          }
        } else { // mediaType === 'tv'
          if (searchTerm) {
            url = `${base}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}&page=${page}`;
          } else {
            url = `${base}/discover/tv?api_key=${TMDB_API_KEY}&page=${page}`;
            if (selectedGenre) url += `&with_genres=${selectedGenre}`;
            if (selectedYear) url += `&first_air_date_year=${selectedYear}`;
            else url += `&first_air_date_year.lte=${currentYear}`; // Default to current year or earlier
          }
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${mediaType} data: ${res.statusText}`);
        }
        const data = await res.json();
        setMediaItems(data.results || []);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error(`Error fetching ${mediaType} data:`, err);
        setError(`Failed to load ${mediaType} content: ${err.message}. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaItems();
  }, [page, searchTerm, selectedGenre, selectedYear, mediaType]); // Depend on mediaType

  // Handlers for filter changes
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    setPage(1);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setPage(1);
  };

  // Handlers for pagination
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  // Handle media type switch
  const handleMediaTypeChange = (type) => {
    setMediaType(type);
    setPage(1); // Reset pagination
    setSearchTerm(""); // Clear search
    setSelectedGenre(""); // Clear genre
    setSelectedYear(""); // Clear year
  };

  // Determine which genres to show in the filter
  const currentGenres = mediaType === 'movie' ? movieGenres : tvGenres;

  return (
    <div style={styles.container}>
      <Banner user={user} />
      
      {/* Media Type Toggle */}
      <div style={styles.mediaTypeToggle}>
        <button
          onClick={() => handleMediaTypeChange('movie')}
          style={{ ...styles.mediaTypeButton, ...(mediaType === 'movie' && styles.mediaTypeButtonActive) }}
        >
          <Film size={20} /> Movies
        </button>
        <button
          onClick={() => handleMediaTypeChange('tv')}
          style={{ ...styles.mediaTypeButton, ...(mediaType === 'tv' && styles.mediaTypeButtonActive) }}
        >
          <Tv size={20} /> TV Series
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder={`Search ${mediaType} title...`}
          value={searchTerm}
          onChange={handleSearch}
          style={styles.input}
        />

        <select
          value={selectedGenre}
          onChange={handleGenreChange}
          style={styles.select}
        >
          <option value="">All Genres</option>
          {currentGenres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={handleYearChange}
          style={styles.select}
        >
          <option value="">All Years</option>
          {Array.from({ length: 25 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#fff' }}>Loading {mediaType}s...</p>}
      {error && <p style={{ textAlign: 'center', color: 'red' }}>Error: {error}</p>}

      {/* Media Grid */}
      {!loading && !error && mediaItems.length === 0 && (
        <p style={{ textAlign: 'center', color: '#ccc' }}>No {mediaType}s found matching your criteria.</p>
      )}
      {!loading && !error && mediaItems.length > 0 && (
        <div style={styles.grid}>
          {mediaItems.map((item) => (
            <div key={item.id} style={styles.card}>
              <Link to={`/${mediaType}/${item.id}`}> {/* Dynamic link based on mediaType */}
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path || item.backdrop_path}`} // Use backdrop for TV if poster missing
                  alt={mediaType === 'movie' ? item.title : item.name}
                  style={styles.image}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/500x750/000000/FFFFFF?text=No+Poster"; }}
                />
              </Link>

              <div style={styles.info}>
                <h2 style={styles.title}>{mediaType === 'movie' ? item.title : item.name}</h2>
                <p>
                  <strong>Release:</strong> {mediaType === 'movie' ? item.release_date : item.first_air_date}
                </p>
                <p>
                  <strong>Rating:</strong> {item.vote_average?.toFixed(1)} ⭐ {/* Format rating */}
                </p>
                <p>{item.overview?.substring(0, 100)}...</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div style={styles.pagination}>
        <button
          onClick={handlePrev}
          disabled={page === 1}
          style={{ ...styles.button, ...(page === 1 && styles.buttonDisabled) }}
        >
          ◀ Prev
        </button>
        <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          style={{ ...styles.button, ...(page === totalPages && styles.buttonDisabled) }}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#121212",
    color: "#fff",
    padding: "2rem",
    margin: "0 auto",
    fontFamily: "Inter, sans-serif", // Changed to Inter for consistency
  },
  mediaTypeToggle: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '2rem',
  },
  mediaTypeButton: {
    backgroundColor: '#2d3748',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.1s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  mediaTypeButtonActive: {
    backgroundColor: '#63b3ed',
    transform: 'scale(1.05)',
  },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "1rem", // Reduced gap for better responsiveness
    paddingTop: "1.5rem", // Adjusted padding
    marginBottom: "1.5rem",
  },
  input: {
    padding: "0.75rem", // Increased padding
    borderRadius: "8px", // More rounded
    background: "#2d3748", // Darker background for input
    color: "#fff",
    border: "1px solid #4a5568", // Subtle border
    width: "100%", // Full width on small screens
    maxWidth: "350px", // Max width on larger screens
    boxShadow: "0 0 8px rgba(0, 216, 255, 0.1)",
    outline: 'none', // Remove outline on focus
  },
  select: {
    padding: "0.75rem", // Increased padding
    borderRadius: "8px", // More rounded
    border: "1px solid #4a5568",
    boxShadow: "0 0 8px rgba(0, 216, 255, 0.1)",
    width: "100%", // Full width on small screens
    maxWidth: "200px",
    background: "#2d3748",
    color: "#fff",
    cursor: 'pointer',
    outline: 'none',
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between", // Space between buttons
    alignItems: "center",
    gap: "1rem",
    paddingTop: "1.8rem",
    paddingLeft: "0", // Removed fixed padding
    paddingRight: "0", // Removed fixed padding
    flexWrap: 'wrap', // Allow wrapping on small screens
  },
  button: {
    backgroundColor: "#007bff", // Blue color for consistency
    color: "#fff",
    border: "none",
    padding: "0.8rem 1.5rem", // Increased padding
    borderRadius: "8px", // More rounded
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.3s ease, transform 0.1s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    whiteSpace: 'nowrap', // Prevent wrapping of "Page X of Y"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", // Adjusted minmax for better responsiveness
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: "10px",
    overflow: "hidden",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 0 10px rgba(0, 216, 255, 0.1)",
    display: 'flex',
    flexDirection: 'column',
  },
  image: {
    width: "100%",
    height: "300px", // Adjusted height for better consistency with TV series posters
    objectFit: "cover",
  },
  info: {
    padding: "1rem",
    textAlign: "left",
    color: "#ccc",
    flexGrow: 1, // Allows info section to take available space
  },
  title: {
    fontSize: "1.1rem",
    color: "#00d8ff",
    marginBottom: "0.5rem",
    minHeight: '2.2em', // Ensure consistent height for titles
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
  },
};

export default MediaGallery;
