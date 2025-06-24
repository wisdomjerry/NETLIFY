import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download } from "lucide-react";
import "./MovieDetail.css";

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

  // Download link uses the poster image for now
  const downloadLink = movie.poster_path
    ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
    : "#";

  // Replace with real size if you can fetch it; placeholder for now
  const fileSize = "10MB";

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

        <a
          href={downloadLink}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="download-button"
        >
          <Download size={20} />
          Download ({fileSize})
        </a>
      </div>
    </div>
  );
};

export default MovieDetail;
