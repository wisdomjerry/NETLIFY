import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

const UsersPage = () => {
  const [users, setUsers] = useState([]);

  // Load users from localStorage (simulate a user database)
  useEffect(() => {
    // For demo: store all users in localStorage as "users" array
    // If you only have one user, use [user]
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(storedUsers);
  }, []);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Admin Menu</h2>
        <ul>
          <li><a href="/admin">Dashboard</a></li>
          <li><a href="/users">Users</a></li>
          <li><a href="/movies">Movies</a></li>
          <li><a href="/analytics">Analytics</a></li>
          <li><a href="/settings">Settings</a></li>
        </ul>
      </aside>

      {/* Main Users Content */}
      <main className="dashboard-main">
        <h1>👥 Users</h1>
        <section className="analytics-section">
          <div className="cards" style={{ flexDirection: "column" }}>
            {users.length === 0 ? (
              <div className="card">
                <h2>No users found</h2>
                <p>No users have logged in yet.</p>
              </div>
            ) : (
              users.map((user, idx) => (
                <div className="card" key={idx} style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <img
                      src={user.avatar || "https://ui-avatars.com/api/?name=" + user.username}
                      alt={user.username}
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        background: "#eee"
                      }}
                    />
                    <div>
                      <h2 style={{ margin: 0 }}>{user.username}</h2>
                      <p style={{ margin: 0, color: "#888" }}>{user.email}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: "12px" }}>
                    <strong>Details:</strong>
                    <ul>
                      <li>Role: {user.role || (user.email === "wisdom.jeremiah.upti@gmail.com" ? "Admin" : "User")}</li>
                      <li>Joined: {user.joined || "Unknown"}</li>
                      <li>Status: {user.active ? "Active" : "Offline"}</li>
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default UsersPage;