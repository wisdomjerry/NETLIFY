import React, { useState, useEffect } from "react";
import axios from "axios";

const API_KEY = "92ccdddf"; // Replace with your OMDb API key

const ImdbMovies = () => {
  const [search, setSearch] = useState("batman");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMovies = async (query) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`
      );
      setMovies(res.data.Search || []);
    }catch (err) {
  console.error(err);
  setMovies([]);
}
    setLoading(false);
  };

  useEffect(() => {
    fetchMovies(search);
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMovies(search);
  };

  return (
    <div>
      <h2>IMDB Movies Search</h2>
      <form onSubmit={handleSearch}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search movies..."
        />
        <button type="submit">Search</button>
      </form>
      {loading && <p>Loading...</p>}
      <ul>
        {movies.map((movie) => (
          <li key={movie.imdbID}>
            <img src={movie.Poster} alt={movie.Title} width={50} />
            {movie.Title} ({movie.Year})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImdbMovies;