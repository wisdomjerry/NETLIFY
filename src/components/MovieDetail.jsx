import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download } from "lucide-react";

const MovieDetail = () => {
  const { id } = useParams();
  const apiKey = "688fd03556ed51e7944c50c4783c6023";
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`)
      .then((res) => res.json())
      .then((data) => setMovie(data));
  }, [id]);

  if (!movie) return <p style={{ color: "white", padding: "2rem" }}>Loading...</p>;

  // Define a placeholder or dynamic download link
  const downloadLink = movie && movie.poster_path
    ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
    : "#";

  // Optionally, define a placeholder file size
  const fileSize = "10MB";

  return (
    <div style={{ background: "#121212", color: "#fff", padding: "2rem" }}>
      <h1>{movie.title}</h1>
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        style={{ width: "300px", borderRadius: "10px", marginBottom: "1rem" }}
      />
      <p><strong>Release:</strong> {movie.release_date}</p>
      <p><strong>Rating:</strong> {movie.vote_average}</p>
      <p><strong>Runtime:</strong> {movie.runtime} minutes</p>
      <p><strong>Genres:</strong> {movie.genres.map((g) => g.name).join(", ")}</p>
      <p><strong>Overview:</strong> {movie.overview}</p>
       {/* Download Button */}
      <div style={{ marginTop: "2rem" }}>
        <a
          href={downloadLink}
          download
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            backgroundColor: "#8b5cf6",
            color: "white",
            fontWeight: "bold",
            borderRadius: "10px",
            textDecoration: "none",
            fontSize: "1rem",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            transition: "background-color 0.3s ease, transform 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#7c3aed")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8b5cf6")}
        >
          <Download size={20} />
          <span>Download ({fileSize})</span>
        </a>
      </div>
    </div>
  );
};

export default MovieDetail;
