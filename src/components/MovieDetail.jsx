import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Download, Film, Link, Subtitles, Play } from "lucide-react"; // Added Play icon
import axios from "axios";
// Removed: import "./MovieDetail.css"; // This import causes the compilation error in this environment

const TMDB_API_KEY = "688fd03556ed51e7944c50c4783c6023";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [torrents, setTorrents] = useState([]);
  const [streamInstead, setStreamInstead] = useState(false);
  const [vjAvailable, setVjAvailable] = useState(false);
  const [streamUrl, setStreamUrl] = useState(null); // New state for the direct stream URL
  const [message, setMessage] = useState(null); // State for custom messages
  const [videoError, setVideoError] = useState(false); // State for video playback errors
  const [streamLoading, setStreamLoading] = useState(false); // New state for stream preparation loading

  // States for subtitle functionality
  const [subtitleLoading, setSubtitleLoading] = useState(false);
  const [subtitleUrl, setSubtitleUrl] = useState(null);
  const [subtitleMessage, setSubtitleMessage] = useState(null);

  // Ref to prevent multiple stream requests if already loading
  const streamRequestSent = useRef(false);

  // Effect to fetch movie details and torrents from TMDB and YTS
  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) {
        setMessage("Movie ID is missing. Cannot fetch details.");
        return;
      }

      try {
        // Fetch movie details from TMDB
        const movieRes = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`
        );

        if (!movieRes.ok) {
          const errorText = movieRes.statusText || 'Unknown Error';
          const errorMessage = `TMDB API error: ${movieRes.status} - ${errorText}`;
          throw new Error(errorMessage);
        }
        const movieData = await movieRes.json();
        setMovie(movieData);

        // Fetch torrents from YTS using the movie title
        const ytsRes = await axios.get(
          `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(movieData.title)}`
        );
        const ytsMovies = ytsRes.data.data.movies;

        if (ytsMovies && ytsMovies.length > 0) {
          setTorrents(ytsMovies[0].torrents);
          const title = movieData.title.toLowerCase();
          setVjAvailable(
            title.includes("vj") ||
            title.includes("luganda") ||
            title.includes("yoruba") ||
            title.includes("twi")
          );
        } else {
          setMessage("No torrents found for this movie on YTS.");
        }
      } catch (err) {
        console.error("Error loading movie or torrents:", err);
        setMessage(`Failed to load movie details: ${err.message}. Please try again.`);
      }
    };

    fetchMovie();
  }, [id]);

  // Determine the best quality torrent available
  const preferredQuality = ["1080p", "720p", "480p"];
  const bestTorrent =
    torrents.find((t) => preferredQuality.includes(t.quality)) || torrents[0];

  // Construct the magnet link for the best torrent
  const magnetLink = bestTorrent
    ? `magnet:?xt=urn:btih:${bestTorrent.hash}&dn=${encodeURIComponent(
        movie?.title || "movie"
      )}&tr=udp://tracker.openbittorrent.com:80` // Example tracker
    : null;

  // New function to handle streaming request to your backend
    
  // Effect to trigger stream request when streamInstead is toggled
 // Depend on streamInstead and magnetLink

  // Function to fetch and display subtitle link (remains largely the same)
  const fetchAndDisplaySubtitleLink = async () => {
    setSubtitleLoading(true);
    setSubtitleUrl(null);
    setSubtitleMessage("Searching for subtitles...");

    try {
      // This would be a call to your backend API for subtitles
      // const response = await axios.post('/api/get-movie-subtitle', {
      //   title: movie.title,
      //   imdb_id: movie.imdb_id
      // });
      // const data = response.data;

      // --- MOCK BACKEND RESPONSE for Subtitles ---
      const data = await new Promise(resolve => setTimeout(() => {
        const success = Math.random() > 0.2;
        if (success) {
          resolve({
            status: 'success',
            subtitleUrl: 'https://example.com/subtitles/mock-inception.srt', // Replace with actual URL from your backend
            message: 'Subtitles found! Click to download.'
          });
        } else {
          resolve({
            status: 'error',
            message: 'No subtitles found for this movie or an error occurred.'
          });
        }
      }, 1500));
      // --- END MOCK BACKEND RESPONSE ---

      if (data.status === 'success') {
        setSubtitleUrl(data.subtitleUrl);
        setSubtitleMessage(data.message);
      } else {
        setSubtitleMessage(data.message || 'Failed to find subtitles.');
      }
    } catch (error) {
      console.error('Error fetching subtitles:', error);
      setSubtitleMessage('Error fetching subtitles. Please try again later.');
    } finally {
      setSubtitleLoading(false);
    }
  };

  // Handler for direct download with subtitle
  const handleDownloadWithSubtitle = () => {
    if (!magnetLink) {
      setMessage("Magnet link is not available for download.");
      return;
    }
    // 1. Initiate the movie download via magnet link
    window.open(magnetLink, "_blank");

    // 2. Separately initiate subtitle search and provide download link
    fetchAndDisplaySubtitleLink();
  };

  // Handler for video playback errors
  const handleVideoError = (e) => {
    console.error("Video playback error:", e);
    setVideoError(true);
    setMessage("Video playback failed. The stream might not be ready or the link is invalid.");
  };

  // Render loading state while movie data is being fetched
  if (!movie) {
    return <p style={{ color: "white", textAlign: "center", padding: "20px" }}>Loading movie details...</p>;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#1a202c', // Dark background
      color: 'white',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Custom Message Box */}
      {message && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          zIndex: 1000,
          boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
          maxWidth: '90%',
          wordBreak: 'break-word'
        }}>
          <p>{message}</p>
          <button
            onClick={() => setMessage(null)}
            style={{
              marginTop: '15px',
              padding: '8px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}

      <img
        style={{
          width: '100%',
          maxWidth: '300px',
          height: 'auto',
          borderRadius: '10px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          marginBottom: '20px',
          objectFit: 'cover'
        }}
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        // Fallback for broken image or missing poster
        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/500x750/000000/FFFFFF?text=No+Poster"; }}
      />
      <div style={{
        width: '100%',
        maxWidth: '800px',
        backgroundColor: '#2d3748', // Slightly lighter dark background for info box
        padding: '25px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        textAlign: 'left'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '15px', color: '#63b3ed' }}>{movie.title}</h1>
        <p style={{ marginBottom: '8px' }}>
          <strong>Release:</strong> {movie.release_date}
        </p>
        <p style={{ marginBottom: '8px' }}>
          <strong>Rating:</strong> {movie.vote_average?.toFixed(1)} ⭐ {/* Format rating to one decimal */}
        </p>
        <p style={{ marginBottom: '8px' }}>
          <strong>Runtime:</strong> {movie.runtime} min
        </p>
        <p style={{ marginBottom: '15px' }}>
          <strong>Genres:</strong> {movie.genres.map((g) => g.name).join(", ")}
        </p>
        <p style={{ lineHeight: '1.6' }}>{movie.overview}</p>

        {vjAvailable && (
          <p style={{ color: "#66ff66", fontWeight: "bold", marginTop: "15px" }}>
            ✅ VJ or Local Language version might be available
          </p>
        )}

        <label
          style={{ display: "flex", alignItems: "center", marginTop: "1rem", color: "white" }}
        >
          <input
            type="checkbox"
            checked={streamInstead}
            onChange={() => {
              setStreamInstead(!streamInstead);
              setStreamUrl(null); // Clear stream URL when toggling
              setVideoError(false); // Reset video error
              setMessage(null); // Clear any existing messages
              setSubtitleMessage(null); // Clear subtitle message when switching
              setSubtitleUrl(null); // Clear subtitle URL
              setStreamLoading(false); // Reset stream loading
              streamRequestSent.current = false; // Reset ref
            }}
            style={{ marginRight: "0.5rem" }}
          />
          Stream Instead of Download
        </label>

        {streamInstead ? ( // If streamInstead is checked
          streamLoading ? (
            <p style={{ marginTop: "1rem", color: "#999", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {message || "Preparing stream from cloud service..."}
            </p>
          ) : streamUrl && !videoError ? ( // And streamUrl is ready and no video error
            <video
              controls
              autoPlay
              style={{
                width: "100%",
                height: "auto", // Changed to auto for better responsiveness
                maxHeight: "70vh", // Max height to prevent excessive size
                marginTop: "1rem",
                borderRadius: "10px",
                backgroundColor: "#000",
              }}
              onError={handleVideoError} // Add error handler
            >
              <source
                src={streamUrl}
                type="video/mp4" // Assuming MP4 from cloud service
              />
              {subtitleUrl && (
                <track
                  kind="subtitles"
                  src={subtitleUrl}
                  srcLang="en" // Assuming English subtitles, you might want to make this dynamic
                  label="English"
                  default // Make them default to show if available
                />
              )}
              Your browser does not support the video tag.
            </video>
          ) : videoError ? ( // If there was a video error
            <p style={{ marginTop: "1rem", color: "#ff6666" }}>
              ❌ Video stream failed to load. {message}
            </p>
          ) : ( // Otherwise, stream is not yet ready or an error occurred
            <p style={{ marginTop: "1rem", color: "#999" }}>
              Click "Stream Instead of Download" to begin streaming.
            </p>
          )
        ) : ( // If streamInstead is not checked, show download button
          <>
            <button
              onClick={handleDownloadWithSubtitle}
              style={{
                marginTop: "1rem",
                padding: "0.8rem 1.5rem", // Increased padding for better touch target
                fontSize: "1rem",
                borderRadius: "8px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                transition: "background-color 0.3s ease",
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
              <Download size={20} /> Download Movie ({bestTorrent?.size || 'N/A'})
            </button>

            {/* Subtitle Status and Download Link */}
            {subtitleLoading && (
              <p style={{ marginTop: "1rem", color: "#999", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {subtitleMessage}
              </p>
            )}
            {subtitleUrl && !subtitleLoading && (
              <a
                href={subtitleUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: "1rem",
                  padding: "0.8rem 1.5rem",
                  fontSize: "1rem",
                  borderRadius: "8px",
                  backgroundColor: "#28a745", // Green for subtitle download
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex", // Use inline-flex for button-like appearance
                  alignItems: "center",
                  gap: "0.5rem",
                  textDecoration: "none", // Remove underline from link
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  transition: "background-color 0.3s ease",
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
              >
                <Subtitles size={20} /> {subtitleMessage || "Download Subtitle"}
              </a>
            )}
            {subtitleMessage && !subtitleLoading && !subtitleUrl && (
              <p style={{ marginTop: "1rem", color: "#ff6666" }}>
                ❌ {subtitleMessage}
              </p>
            )}
          </>
        )}

        <div style={{ marginTop: "1rem", color: "#ccc", fontSize: "0.9rem" }}>
          ⚠️ Magnet links require a torrent client like qBittorrent or WebTorrent Desktop for direct download.
          <br />
          For streaming, this app relies on a **backend service** to convert magnet links to direct video streams.
          <br />
          <strong>No local TorrServer needed for streaming!</strong>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
