import React, { useEffect, useState } from "react";
import Banner from "./Banner";
import { Link } from "react-router-dom";

const MovieGallery = ({user}) => {
  const apiKey = "688fd03556ed51e7944c50c4783c6023";
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Fetch genres on load
  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`)
      .then((res) => res.json())
      .then((data) => setGenres(data.genres));
  }, []);

  // Fetch movies
  useEffect(() => {
    const fetchMovies = async () => {
      let url = "";
      const base = "https://api.themoviedb.org/3";

      if (searchTerm) {
        url = `${base}/search/movie?api_key=${apiKey}&query=${searchTerm}&page=${page}`;
      } else {
        url = `${base}/discover/movie?api_key=${apiKey}&page=${page}`;

        if (selectedGenre) url += `&with_genres=${selectedGenre}`;
        if (selectedYear) url += `&primary_release_year=${selectedYear}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setMovies(data.results || []);
      setTotalPages(data.total_pages || 1);
    };

    fetchMovies();
  }, [page, searchTerm, selectedGenre, selectedYear]);

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

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <div style={styles.container}>
      <Banner user={user} />
        {/* other movie sections */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search movie title..."
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
          {genres.map((g) => (
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

      <div style={styles.grid}>
        {movies.map((movie) => (
          <div key={movie.id} style={styles.card}>
            <Link to={`/movie/${movie.id}`}>
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                style={styles.image}
              />
            </Link>

            <div style={styles.info}>
              <h2 style={styles.title}>{movie.title}</h2>
              <p>
                <strong>Release:</strong> {movie.release_date}
              </p>
              <p>
                <strong>Rating:</strong> {movie.vote_average} ⭐
              </p>
              <p>{movie.overview?.substring(0, 100)}...</p>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.pagination}>
        <button
          onClick={handlePrev}
          disabled={page === 1}
          style={styles.button}
        >
          ◀ Prev
        </button>
        <span style={styles.pageInfo}>Page {page}</span>
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          style={styles.button}
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
    // maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "Segoe UI, sans-serif",
  },
  heading: {
    marginBottom: "2rem",
    color: "#00d8ff",
    textAlign: "center",
  },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "2rem",
    paddingTop: "3.5rem",
    marginBottom: "1.5rem",
  },
  input: {
    padding: "0.5rem",
    borderRadius: "5px",
    background: "hsl(0, 0.00%, 25.90%)",
    borderColor: "red",
    border: "1px solid red",
    width: "350px",
    boxShadow: "0 0 5px rgba(160, 89, 89, 0.2)",
  },
  select: {
    padding: "0 0.5rem",
    borderRadius: "5px",
    borderColor: "red",
    border: "1px solid red",
    boxShadow: "0 0 5px rgba(160, 89, 89, 0.2)",
    width: "200px",
    background: "black",
    color: "#fff",
  },
  pagination: {
    display: "flex",
    justifyContent: "end",
    alignItems: "center",
    gap: "1rem",
    paddingTop: "1.8rem",
    paddingLeft: "2.8rem",
  },
  button: {
    // backgroundColor: "#00d8ff",
    color: "#121212",
    border: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  pageInfo: {
    fontSize: "1.1rem",
    fontWeight: "bold",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: "10px",
    overflow: "hidden",
    transition: "transform 0.3s ease",
    boxShadow: "0 0 10px rgba(0, 216, 255, 0.1)",
  },
  image: {
    width: "100%",
    height: "350px",
    objectFit: "cover",
  },
  info: {
    padding: "1rem",
    textAlign: "left",
    color: "#ccc",
  },
  title: {
    fontSize: "1.1rem",
    color: "#00d8ff",
    marginBottom: "0.5rem",
  },
};

export default MovieGallery;
