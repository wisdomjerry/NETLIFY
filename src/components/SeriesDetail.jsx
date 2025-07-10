import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const SeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiKey = "688fd03556ed51e7944c50c4783c6023";

  const [series, setSeries] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);

  useEffect(() => {
    const fetchSeries = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=en-US`
      );
      const data = await res.json();
      setSeries(data);
      // Default to season 1 or first season available
      if (data.seasons && data.seasons.length > 0) {
        setSelectedSeason(data.seasons[0].season_number);
      }
    };

    fetchSeries();
  }, [id]);

  const handleSeasonChange = (e) => {
    const seasonNumber = e.target.value;
    setSelectedSeason(seasonNumber);
    // Navigate to episodes list or episode detail page for the selected season
    navigate(`/series/${id}/season/${seasonNumber}/episode/1`);
  };

  if (!series) {
    return <p style={{ color: "white", padding: "2rem" }}>Loading series info...</p>;
  }

  return (
    <div className="series-detail-container" style={{ color: "white", padding: "2rem" }}>
      <h1>{series.name}</h1>
      <img
        src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
        alt={series.name}
        style={{ maxWidth: "300px", borderRadius: "8px" }}
      />
      <p><strong>Genres:</strong> {series.genres.map(g => g.name).join(", ")}</p>
      <p><strong>First Air Date:</strong> {series.first_air_date}</p>
      <p>{series.overview}</p>

      <div style={{ marginTop: "1.5rem" }}>
        <label htmlFor="season-select">Select Season: </label>
        <select
          id="season-select"
          value={selectedSeason}
          onChange={handleSeasonChange}
          style={{ padding: "0.5rem", borderRadius: "6px", fontSize: "1rem" }}
        >
          {series.seasons.map(season => (
            <option key={season.id} value={season.season_number}>
              Season {season.season_number} ({season.episode_count} episodes)
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SeriesDetail;
