import React, { useState } from "react";
import "./AdminDashboard.css";

const mockMovies = [
  { id: 1, title: "The Dark Knight", streaming: true },
  { id: 2, title: "Inception", streaming: false },
  { id: 3, title: "Joker", streaming: true },
];

const AdminDashboard = () => {
  const [movies, setMovies] = useState(mockMovies);
  const [usersCount] = useState(254); // Replace with real data from backend

  const toggleStreaming = (id) => {
    setMovies((prev) =>
      prev.map((movie) =>
        movie.id === id ? { ...movie, streaming: !movie.streaming } : movie
      )
    );
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Admin Menu</h2>
        <ul>
          <li><a href="./Dashboard">Dashboard</a></li>
          <li><a href="./Users">Users</a></li>
          <li><a href="./Movies">Movies</a></li>
          <li><a href="./Analytics">Analytics</a></li>
        </ul>
      </aside>

      {/* Main Dashboard */}
      <main className="dashboard-main">
        <h1>🎬 Netlify Admin Dashboard</h1>

        {/* Analytics Section */}
        <section className="analytics-section">
          <div className="cards">
            <div className="card">
              <h2>👤 Total Users</h2>
              <p style={{ fontSize: "2rem", color: "#10b981", fontWeight: "bold" }}>{usersCount}</p>
            </div>
            <div className="card">
              <h2>🎞️ Total Movies</h2>
              <p style={{ fontSize: "2rem", color: "#3b82f6", fontWeight: "bold" }}>{movies.length}</p>
            </div>
          </div>
        </section>

        {/* Movies Section */}
        <section className="movies-section">
          <h2>Movie Management</h2>
          <table className="movie-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Toggle</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id}>
                  <td>{movie.title}</td>
                  <td>
                    <span className={`status ${movie.streaming ? "live" : "off"}`}>
                      {movie.streaming ? "Streaming" : "Not Streaming"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => toggleStreaming(movie.id)}>
                      Toggle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Analytics Overview */}
        <section className="analytics-section" style={{ marginTop: "30px" }}>
          <div className="card">
            <h2>📊 Analytics Overview</h2>
            <p>More detailed charts coming soon...</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;