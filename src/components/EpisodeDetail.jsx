import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Download, Play } from "lucide-react"; // Import Play icon

const TMDB_API_KEY = "688fd03556ed51e7944c50c4783c6023";
// Define your backend URL here. If running locally, it's http://localhost:3001
// If deployed, replace with your VPS IP or domain.
const BACKEND_URL = "http://localhost:3001"; 

const EpisodeDetail = () => {
  const { id, seasonNumber, episodeNumber } = useParams();
  
  const [episode, setEpisode] = useState(null);
  const [seriesData, setSeriesData] = useState(null); // New state to store full series data
  const [seriesTitle, setSeriesTitle] = useState("");
  const [imdbId, setImdbId] = useState(null); 
  const [torrents, setTorrents] = useState([]); // Stores torrents (from your custom API)
  const [watching, setWatching] = useState(false); // State to control video modal visibility
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // Custom message state for user feedback

  const videoRef = useRef(null); // Ref for the video element
  const webTorrentClientInstance = useRef(null); // Ref for WebTorrent client instance

  // Effect to dynamically load WebTorrent.js and initialize client
  useEffect(() => {
    if (typeof window.WebTorrent === 'undefined') {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/webtorrent@1.0.3/webtorurl.min.js"; // Using a stable CDN version
      script.async = true;
      script.onload = () => {
        webTorrentClientInstance.current = new window.WebTorrent();
        console.log("WebTorrent client initialized.");
      };
      script.onerror = () => {
        setMessage("Failed to load WebTorrent library. Streaming will not work.");
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
        if (webTorrentClientInstance.current) {
          webTorrentClientInstance.current.destroy();
          webTorrentClientInstance.current = null;
        }
      };
    } else {
      webTorrentClientInstance.current = new window.WebTorrent();
      console.log("WebTorrent client already available and initialized.");
    }

    return () => {
      if (webTorrentClientInstance.current) {
        console.log("Destroying WebTorrent client.");
        webTorrentClientInstance.current.destroy();
        webTorrentClientInstance.current = null;
      }
    };
  }, []); // Run once on mount

  // Fetch episode details, series info, and IMDb ID
  useEffect(() => {
    const fetchEpisodeAndSeriesData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch episode details
        const epRes = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        if (!epRes.ok) {
          throw new Error(`Failed to fetch episode details: ${epRes.statusText}`);
        }
        const epData = await epRes.json();
        setEpisode(epData);

        // Fetch series info & IMDb ID
        const seriesRes = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`
        );
        if (!seriesRes.ok) {
          throw new Error(`Failed to fetch series details: ${seriesRes.statusText}`);
        }
        const seriesData = await seriesRes.json();
        setSeriesData(seriesData); // Store full series data
        setSeriesTitle(seriesData.name);
        setImdbId(seriesData.external_ids?.imdb_id); // Access IMDb ID directly from external_ids
      } catch (err) {
        console.error("Error fetching episode or series data:", err);
        setError(`Failed to load episode details: ${err.message}. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodeAndSeriesData();
  }, [id, seasonNumber, episodeNumber]);

  // Fetch torrents using your custom backend API
  useEffect(() => {
    const fetchTorrents = async () => {
      if (!imdbId || !seasonNumber || !episodeNumber) {
        setTorrents([]); // Clear torrents if essential data is missing
        return; 
      }

      try {
        // Make the request to your CUSTOM backend API for series torrents
        const res = await axios.get(
          `${BACKEND_URL}/api/series/torrents`, { // <-- Changed to your custom API endpoint
            params: {
              imdb_id: imdbId, 
              seasonNumber: seasonNumber,
              episodeNumber: episodeNumber
            }
          }
        );

        if (res.data && res.data.torrents) {
          setTorrents(res.data.torrents);
          if (res.data.torrents.length === 0) {
            setMessage("No torrents found for this specific episode via your custom backend (EZTV source).");
          } else {
            setMessage(null); // Clear message if torrents are found
          }
        } else {
          setMessage("No torrents found for this series via your custom backend.");
        }
      } catch (err) {
        console.error("Error fetching torrents via custom backend:", err);
        setMessage("Error fetching torrents. Ensure your custom backend API server is running.");
        setTorrents([]); // Clear torrents on error
      }
    };

    // Only fetch torrents once imdbId is available
    if (imdbId) {
      fetchTorrents();
    }
  }, [imdbId, seasonNumber, episodeNumber]); // Depend on these to re-fetch when they change

  // Start streaming with WebTorrent
  const startStreaming = (magnetURI) => {
    if (!webTorrentClientInstance.current) {
      setMessage("WebTorrent is still loading or failed to initialize. Please wait a moment or refresh.");
      return;
    }

    // Destroy any existing torrents before adding a new one
    webTorrentClientInstance.current.torrents.forEach(torrent => torrent.destroy());

    const client = webTorrentClientInstance.current; // Use the ref for the client instance
    
    setWatching(true); // Show the video modal
    setMessage("Starting stream... This may take a moment to find peers.");

    client.add(magnetURI, (torrent) => {
      setMessage("Torrent added. Finding peers and downloading metadata...");

      torrent.on('ready', () => {
        setMessage("Torrent metadata ready. Looking for video file...");
        const file = torrent.files.find((file) =>
          /\.(mp4|mkv|webm)$/i.test(file.name)
        );

        if (file && videoRef.current) {
          setMessage(`Found video file: ${file.name}. Starting playback...`);
          file.renderTo(videoRef.current, {
            autoplay: true,
            controls: true
          }, (err) => {
            if (err) {
              console.error("Error rendering video to element:", err);
              setMessage("Error playing video stream. Check console for details.");
              setWatching(false);
            } else {
              setMessage("Streaming started!");
            }
          });
        } else {
          setMessage("No playable video file found in this torrent.");
          setWatching(false);
        }
      });

      torrent.on('error', (err) => {
        console.error("WebTorrent error:", err);
        setMessage(`Streaming error: ${err.message}. Please try again.`);
        setWatching(false);
      });

      torrent.on('download', () => {
        const progress = (torrent.progress * 100).toFixed(1);
        setMessage(`Downloading: ${progress}% - Peers: ${torrent.numPeers}`);
      });

      torrent.on('done', () => {
        setMessage("Torrent download complete!");
      });
    });
  };

  const closeVideoModal = () => {
    setWatching(false);
    if (webTorrentClientInstance.current) {
      webTorrentClientInstance.current.torrents.forEach(torrent => torrent.destroy());
    }
    setMessage(null); // Clear message when closing modal
  };

  if (loading && !episode) {
    return <p style={styles.loadingText}>Loading episode info...</p>;
  }

  if (error) {
    return <p style={styles.errorText}>Error: {error}</p>;
  }

  if (!episode) {
    return <p style={styles.loadingText}>Episode not found.</p>;
  }

  // Use episode still, fallback to series poster, then series backdrop
  const episodePoster = episode.still_path ? `https://image.tmdb.org/t/p/w500${episode.still_path}` : 
                        (seriesData?.poster_path ? `https://image.tmdb.org/t/p/w500${seriesData.poster_path}` : 
                        (seriesData?.backdrop_path ? `https://image.tmdb.org/t/p/w500${seriesData.backdrop_path}` : null));


  // Log image paths for debugging
  console.log("Episode still_path:", episode?.still_path);
  console.log("Series poster_path:", seriesData?.poster_path);
  console.log("Series backdrop_path:", seriesData?.backdrop_path); // New log for backdrop
  console.log("Resolved episodePoster URL:", episodePoster);

  return (
    <div style={styles.container}>
      {/* Custom Message Box */}
      {message && (
        <div style={styles.messageBox}>
          <p>{message}</p>
          <button
            onClick={() => setMessage(null)}
            style={styles.messageButton}
          >
            Close
          </button>
        </div>
      )}

      <div style={styles.header}>
        <img
          src={episodePoster || "https://placehold.co/500x281/000000/FFFFFF?text=No+Image"} // Use fallback if no poster found
          alt={episode.name}
          style={styles.poster}
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/500x281/000000/FFFFFF?text=No+Image"; }}
        />
        <div style={styles.infoSection}>
          <h1 style={styles.title}>
            {seriesTitle} - S{seasonNumber}E{episodeNumber}: {episode.name}
          </h1>
          <p style={styles.detailText}>
            <strong>Air Date:</strong> {episode.air_date}
          </p>
          <p style={styles.detailText}>
            <strong>Rating:</strong> {episode.vote_average?.toFixed(1)} ⭐
          </p>
          <p style={styles.detailText}>
            <strong>Runtime:</strong> {episode.runtime || "N/A"} minutes
          </p>
          <p style={styles.overview}>{episode.overview}</p>
        </div>
      </div>

      <h2 style={styles.torrentsHeading}>Available Torrents (via Your API)</h2>
      {torrents.length > 0 ? (
        <div style={styles.torrentList}>
          {torrents.map((torrent) => {
            // EZTV torrents typically have 'hash' and 'magnet_url' directly
            const magnetLink = torrent.magnet_url || `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(
              torrent.title
            )}&tr=udp://tracker.openbittorrent.com:80`; // Fallback magnet construction

            return (
              <div key={torrent.torrent_id} style={styles.torrentItem}>
                {/* Download via Magnet Link Button */}
                <a
                  href={magnetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.downloadButton}
                >
                  <Download size={18} /> Download (Magnet) {torrent.quality || 'N/A'} ({formatBytes(torrent.size)})
                </a>
                
                {/* Direct .torrent file download button (if torrent_url exists) */}
                {torrent.torrent_url && (
                  <a
                    href={torrent.torrent_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.downloadFileButton} 
                  >
                    <Download size={18} /> Download (.torrent)
                  </a>
                )}

                {/* Watch Button */}
                <button
                  onClick={() => startStreaming(magnetLink)}
                  style={styles.watchButton}
                >
                  <Play size={18} /> Watch {torrent.quality || 'N/A'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={styles.noTorrentsMessage}>
          No torrents found for this episode via your custom API.
          <br/>
          **Please ensure your backend API server is running and check its console for details.**
        </p>
      )}

      {watching && (
        <div
          style={styles.videoModalOverlay}
          onClick={closeVideoModal} // Close modal when clicking outside video
        >
          <video
            ref={videoRef}
            controls
            autoPlay
            style={styles.videoPlayer}
            onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking video
            onError={() => setMessage("Video playback failed. Try another torrent or download.")}
          />
          <button
            onClick={closeVideoModal}
            style={styles.closeButton}
            aria-label="Close video"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function to format bytes into human-readable size (KB, MB, GB)
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


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
  messageBox: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    padding: '20px',
    borderRadius: '10px',
    zIndex: 10000, // Higher zIndex than video modal
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    maxWidth: '90%',
    wordBreak: 'break-word',
    border: '1px solid #63b3ed',
  },
  messageButton: {
    marginTop: '15px',
    padding: '8px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
    width: "100%",
    maxWidth: "900px",
  },
  poster: {
    width: "100%",
    maxWidth: "400px", // Adjusted max width
    height: "auto",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
    objectFit: 'cover',
  },
  infoSection: {
    flex: 1,
    textAlign: "center",
  },
  title: {
    fontSize: "2.2rem", // Slightly smaller for episode title
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
  torrentsHeading: {
    fontSize: "1.8rem",
    marginBottom: "20px",
    color: "#63b3ed",
    textAlign: "center",
    width: "100%",
  },
  torrentList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "100%",
    maxWidth: "600px", // Max width for torrent buttons
    marginBottom: "30px",
  },
  torrentItem: {
    display: "flex",
    flexDirection: "column", // Stack buttons vertically on small screens
    gap: "10px",
    backgroundColor: "#2d3748",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  },
  downloadButton: {
    backgroundColor: "#007bff", // Blue for magnet download
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "bold",
    textDecoration: "none", // Remove underline from link
    display: "flex",
    alignItems: "center",
    justifyContent: 'center', // Center content in button
    gap: "8px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.3s ease",
    flexGrow: 1, // Allow button to grow
  },
  downloadFileButton: { // New style for direct .torrent file download
    backgroundColor: "#28a745", // Green for direct file download
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "bold",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: 'center',
    gap: "8px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.3s ease",
    flexGrow: 1,
  },
  watchButton: {
    backgroundColor: "#e53e3e", // Red for watch button
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: 'center', // Center content in button
    gap: "8px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.3s ease",
    flexGrow: 1, // Allow button to grow
  },
  noTorrentsMessage: {
    textAlign: "center",
    color: "#ffc107", // Yellowish color for warning
    padding: "20px",
    fontSize: "1.1rem",
  },
  videoModalOverlay: {
    position: "fixed",
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    backgroundColor: "rgba(0,0,0,0.95)", // Darker overlay
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  videoPlayer: {
    maxWidth: "95%", // Increased max width
    maxHeight: "95%", // Increased max height
    width: "auto", // Ensure aspect ratio is maintained
    height: "auto",
    borderRadius: "10px",
    boxShadow: "0 0 30px rgba(0,0,0,0.8)",
    backgroundColor: "#000",
  },
  closeButton: {
    position: "absolute",
    top: "20px",
    right: "20px",
    backgroundColor: "#fff",
    color: "#1a202c",
    border: "none",
    borderRadius: "50%",
    width: "40px", // Larger button
    height: "40px",
    fontSize: "1.5rem", // Larger X
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
    transition: 'background-color 0.2s ease, color 0.2s ease',
    '&:hover': {
      backgroundColor: '#e53e3e',
      color: 'white',
    }
  },
};

export default EpisodeDetail;
