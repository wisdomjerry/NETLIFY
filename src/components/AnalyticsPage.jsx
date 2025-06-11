import React from "react";
import "./AdminDashboard.css";

const userStats = [
  { label: "Active Users", value: 187, color: "#10b981" },
  { label: "New Signups (30d)", value: 42, color: "#3b82f6" },
  { label: "Premium Users", value: 23, color: "#eab308" },
];

const movieStats = [
  { title: "The Dark Knight", views: 1200, likes: 320 },
  { title: "Inception", views: 950, likes: 280 },
  { title: "Joker", views: 870, likes: 210 },
];

const AnalyticsPage = () => (
  <div className="dashboard-container">
    {/* Sidebar */}
    <aside className="sidebar">
      <h2>Admin Menu</h2>
      <ul>
        <li>
          <a href="/admin">Dashboard</a>
        </li>
        <li>
          <a href="/users">Users</a>
        </li>
        <li>
          <a href="/movies">Movies</a>
        </li>
        <li>
          <a href="/analytics">Analytics</a>
        </li>
      </ul>
    </aside>

    {/* Main Analytics Content */}
    <main className="dashboard-main">
      <h1>📊 Analytics</h1>

      {/* User Stats Cards */}
      <section className="analytics-section">
        <div className="cards">
          {userStats.map((stat) => (
            <div className="card" key={stat.label}>
              <h2>{stat.label}</h2>
              <p
                style={{
                  fontSize: "2rem",
                  color: stat.color,
                  fontWeight: "bold",
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Movie Stats Table */}
      <section className="movies-section">
        <h2>Top Movies (Views & Likes)</h2>
        <table className="movie-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Views</th>
              <th>Likes</th>
            </tr>
          </thead>
          <tbody>
            {movieStats.map((movie) => (
              <tr key={movie.title}>
                <td>{movie.title}</td>
                <td>{movie.views}</td>
                <td>{movie.likes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Placeholder for Charts */}
      <section className="analytics-section" style={{ marginTop: "30px" }}>
        <div className="card">
          <h2>📈 User Activity Chart</h2>
          <div
            style={{
              width: "100%",
              height: "180px",
              background: "#f3f4f6",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
            }}
          >
            (Chart coming soon)
          </div>
        </div>
      </section>
    </main>
  </div>
);

export default AnalyticsPage;
