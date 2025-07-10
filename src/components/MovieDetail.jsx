import React, { useEffect, useState, useRef } from "react";
import WebTorrent from "webtorrent";
import { useParams } from "react-router-dom";
import { Download } from "lucide-react";
import axios from "axios";
import "./MovieDetail.css";

const MovieDetail = () => {
  const { id } = useParams();
  const apiKey = "688fd03556ed51e7944c50c4783c6023";
  const [movie, setMovie] = useState(null);
  const [torrents, setTorrents] = useState([]);
  const [watching, setWatching] = useState(false);
  const videoRef = useRef(null);
  const clientRef = useRef(null);

  useEffect(() => {
    const fetchMovieAndTorrent = async () => {
      const movieRes = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`
      );
      const movieData = await movieRes.json();
      setMovie(movieData);

      try {
        const ytsRes = await axios.get(
          `https://yts.mx/api/v2/list_movies.json?query_term=${movieData.title}`
        );
        const movies = ytsRes.data.data.movies;
        if (movies && movies.length > 0) {
          setTorrents(movies[0].torrents);
        }
      } catch (err) {
        console.error("Error fetching torrent data", err);
      }
    };

    fetchMovieAndTorrent();

    // Cleanup on unmount: destroy client to stop torrenting
    return () => {
      if (clientRef.current) {
        clientRef.current.destroy();
      }
    };
  }, [id]);

  // Function to start streaming
  const startStreaming = (magnetURI) => {
    if (clientRef.current) {
      clientRef.current.destroy();
      clientRef.current = null;
    }

    const client = new WebTorrent();
    clientRef.current = client;

    client.add(magnetURI, (torrent) => {
      // Find the largest video file (usually the movie)
      const file = torrent.files.find((file) => {
        return file.name.endsWith(".mp4") || file.name.endsWith(".mkv") || file.name.endsWith(".webm");
      });

      if (file && videoRef.current) {
        // Render the video element with the file stream
        file.renderTo(videoRef.current, {
          autoplay: true,
          controls: true,
        });
      }
    });
  };

  if (!movie) {
    return <p style={{ color: "white", padding: "2rem" }}>Loading...</p>;
  }

  // Pick a magnet link (preferably 720p or 1080p if available)
  const preferredQuality = ["1080p", "720p", "480p"];
  const bestTorrent = torrents.find(t =>
    preferredQuality.includes(t.quality)
  ) || torrents[0];

  const magnetLink = bestTorrent
    ? `magnet:?xt=urn:btih:${bestTorrent.hash}&dn=${encodeURIComponent(
        movie.title
      )}&tr=udp://tracker.openbittorrent.com:80`
    : null;

  return (
    <div className="movie-detail-container">
      <img
        className="movie-detail-poster"
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
      />
      <div className="movie-detail-info">
        <h1>{movie.title}</h1>
        <p><strong>Release:</strong> {movie.release_date}</p>
        <p><strong>Rating:</strong> {movie.vote_average} ⭐</p>
        <p><strong>Runtime:</strong> {movie.runtime} minutes</p>
        <p><strong>Genres:</strong> {movie.genres.map((g) => g.name).join(", ")}</p>
        <p>{movie.overview}</p>

        {/* Download Button */}
        {magnetLink && (
          <a
            href={magnetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="download-button"
          >
            <Download size={20} />
            Download ({bestTorrent.size})
          </a>
        )}

        {/* Watch Button */}
        {magnetLink && (
          <button
            onClick={() => {
              setWatching(true);
              startStreaming(magnetLink);
            }}
            className="watch-button"
            style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}
          >
            Watch
          </button>
        )}

        {/* Video Modal */}
        {watching && (
          <div
            className="video-modal"
            onClick={() => {
              setWatching(false);
              if (clientRef.current) {
                clientRef.current.destroy();
                clientRef.current = null;
              }
            }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <video
              ref={videoRef}
              controls
              style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "8px" }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => {
                setWatching(false);
                if (clientRef.current) {
                  clientRef.current.destroy();
                  clientRef.current = null;
                }
              }}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
              }}
              aria-label="Close video"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
