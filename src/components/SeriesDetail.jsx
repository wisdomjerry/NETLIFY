import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tv, Play } from "lucide-react"; // Import icons

const TMDB_API_KEY = "688fd03556ed51e7944c50c4783c6023"; // Using the global API key

const SeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [series, setSeries] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(null); // Changed name for clarity
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch series details and seasons
  useEffect(() => {
    const fetchSeriesDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch series details: ${res.statusText}`);
        }
        const data = await res.json();
        setSeries(data);
        setSeasons(data.seasons || []);

        // Default to the first season that is not "Specials" (season_number 0)
        const firstValidSeason = (data.seasons || []).find(s => s.season_number > 0);
        if (firstValidSeason) {
          setSelectedSeasonNumber(firstValidSeason.season_number);
        } else if (data.seasons && data.seasons.length > 0) {
          // Fallback to season 0 if no other season exists
          setSelectedSeasonNumber(data.seasons[0].season_number);
        }
      } catch (err) {
        console.error("Error fetching series details:", err);
        setError(`Failed to load series details: ${err.message}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchSeriesDetails();
  }, [id]);

  // Fetch episodes for the selected season
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (selectedSeasonNumber !== null && id) {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/tv/${id}/season/${selectedSeasonNumber}?api_key=${TMDB_API_KEY}&language=en-US`
          );
          if (!res.ok) {
            throw new Error(`Failed to fetch episodes for season ${selectedSeasonNumber}: ${res.statusText}`);
          }
          const data = await res.json();
          setEpisodes(data.episodes || []);
        } catch (err) {
          console.error(`Error fetching episodes for season ${selectedSeasonNumber}:`, err);
          setError(`Failed to load episodes for Season ${selectedSeasonNumber}: ${err.message}.`);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEpisodes();
  }, [id, selectedSeasonNumber]); // Re-fetch episodes when season changes

  const handleSeasonChange = (e) => {
    setSelectedSeasonNumber(parseInt(e.target.value)); // Ensure it's a number
  };

  const handleEpisodeClick = (episodeNumber) => {
    // Navigate to the EpisodeDetail page for the clicked episode
    navigate(`/tv/${id}/season/${selectedSeasonNumber}/episode/${episodeNumber}`);
  };

  if (loading && !series) { // Show initial loading only if no series data yet
    return <p style={styles.loadingText}>Loading series info...</p>;
  }

  if (error) {
    return <p style={styles.errorText}>Error: {error}</p>;
  }

  if (!series) { // If loading is false but series is still null (e.g., ID not found)
    return <p style={styles.loadingText}>Series not found.</p>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img
          src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
          alt={series.name}
          style={styles.poster}
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/500x750/000000/FFFFFF?text=No+Poster"; }}
        />
        <div style={styles.infoSection}>
          <h1 style={styles.title}>{series.name}</h1>
          <p style={styles.detailText}>
            <strong>Genres:</strong> {series.genres.map(g => g.name).join(", ")}
          </p>
          <p style={styles.detailText}>
            <strong>First Air Date:</strong> {series.first_air_date}
          </p>
          <p style={styles.detailText}>
            <strong>Rating:</strong> {series.vote_average?.toFixed(1)} ⭐
          </p>
          <p style={styles.overview}>{series.overview}</p>
        </div>
      </div>

      <div style={styles.seasonSelector}>
        <label htmlFor="season-select" style={styles.label}>Select Season: </label>
        <select
          id="season-select"
          value={selectedSeasonNumber || ''} // Handle null case
          onChange={handleSeasonChange}
          style={styles.select}
        >
          {seasons.map(season => (
            <option key={season.id} value={season.season_number}>
              Season {season.season_number} ({season.episode_count} episodes)
            </option>
          ))}
        </select>
      </div>

      <h2 style={styles.episodesHeading}>Episodes</h2>
      {loading && selectedSeasonNumber !== null && (
        <p style={styles.loadingText}>Loading episodes for Season {selectedSeasonNumber}...</p>
      )}
      {!loading && episodes.length === 0 && (
        <p style={styles.noEpisodesText}>No episodes found for Season {selectedSeasonNumber}.</p>
      )}
      {!loading && episodes.length > 0 && (
        <div style={styles.episodesGrid}>
          {episodes.map(episode => (
            <div
              key={episode.id}
              style={styles.episodeCard}
              onClick={() => handleEpisodeClick(episode.episode_number)}
            >
              <img
                src={`https://image.tmdb.org/t/p/w200${episode.still_path}`}
                alt={episode.name}
                style={styles.episodeImage}
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/200x113/000000/FFFFFF?text=No+Image"; }}
              />
              <div style={styles.episodeInfo}>
                <h3 style={styles.episodeTitle}>E{episode.episode_number}: {episode.name}</h3>
                <p style={styles.episodeOverview}>{episode.overview?.substring(0, 120)}...</p>
                <p style={styles.episodeAirDate}>Air Date: {episode.air_date}</p>
                <button style={styles.playButton}>
                  <Play size={18} /> Play
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#1a202c",
    color: "white",
    minHeight: "100vh",
    fontFamily: "Inter, sans-serif",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  loadingText: {
    textAlign: "center",
    padding: "20px",
    color: "#ccc",
  },
  errorText: {
    textAlign: "center",
    padding: "20px",
    color: "red",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
    width: "100%",
    maxWidth: "900px",
    '@media (min-width: 768px)': {
      flexDirection: 'row',
      alignItems: 'flex-start',
    }
  },
  poster: {
    width: "100%",
    maxWidth: "300px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
  },
  infoSection: {
    flex: 1,
    textAlign: "center",
    '@media (min-width: 768px)': {
      textAlign: 'left',
    }
  },
  title: {
    fontSize: "2.8rem",
    marginBottom: "15px",
    color: "#63b3ed",
  },
  detailText: {
    marginBottom: "8px",
    fontSize: "1rem",
  },
  overview: {
    lineHeight: "1.6",
    fontSize: "1rem",
    marginTop: "15px",
  },
  seasonSelector: {
    marginTop: "20px",
    marginBottom: "30px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    maxWidth: "400px",
  },
  label: {
    fontSize: "1.1rem",
    fontWeight: "bold",
  },
  select: {
    padding: "10px 15px",
    borderRadius: "8px",
    fontSize: "1rem",
    backgroundColor: "#2d3748",
    color: "white",
    border: "1px solid #4a5568",
    cursor: "pointer",
    width: "100%",
    maxWidth: "300px",
    outline: 'none',
  },
  episodesHeading: {
    fontSize: "2rem",
    marginBottom: "20px",
    color: "#63b3ed",
    textAlign: "center",
    width: "100%",
  },
  noEpisodesText: {
    textAlign: "center",
    color: "#ccc",
    padding: "20px",
  },
  episodesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", // Responsive grid
    gap: "20px",
    width: "100%",
    maxWidth: "1200px",
  },
  episodeCard: {
    backgroundColor: "#2d3748",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column", // Stack image and info vertically
    alignItems: "center",
    textAlign: "center",
    paddingBottom: '15px',
  },
  episodeImage: {
    width: "100%",
    height: "180px", // Fixed height for consistency
    objectFit: "cover",
    borderBottom: "1px solid #4a5568",
    marginBottom: "10px",
  },
  episodeInfo: {
    padding: "0 15px",
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
  },
  episodeTitle: {
    fontSize: "1.2rem",
    color: "#00d8ff",
    marginBottom: "8px",
    minHeight: '2.4em', // Consistent height for two lines
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
  },
  episodeOverview: {
    fontSize: "0.9rem",
    color: "#ccc",
    marginBottom: "10px",
    minHeight: '3.6em', // Consistent height for three lines
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: '3',
    WebkitBoxOrient: 'vertical',
  },
  episodeAirDate: {
    fontSize: "0.85rem",
    color: "#aaa",
    marginBottom: "15px",
  },
  playButton: {
    backgroundColor: "#e53e3e", // Red Play button
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.3s ease",
    marginTop: 'auto', // Push button to the bottom of the card
    width: 'fit-content', // Fit content width
    alignSelf: 'center', // Center the button
  },
};

export default SeriesDetail;
