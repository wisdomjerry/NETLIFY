import React, { useState } from "react";

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
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4">🎬 Netlify Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold">👤 Total Users</h2>
          <p className="text-2xl font-bold text-green-600 mt-2">{usersCount}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4 col-span-2">
          <h2 className="text-lg font-semibold">🎞️ Movie Management</h2>
          <ul className="mt-3 space-y-3">
            {movies.map((movie) => (
              <li
                key={movie.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-medium">{movie.title}</p>
                  <p
                    className={`text-sm ${
                      movie.streaming ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {movie.streaming ? "Streaming" : "Not Streaming"}
                  </p>
                </div>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => toggleStreaming(movie.id)}
                >
                  Toggle
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white shadow rounded-lg p-4 lg:col-span-3">
          <h2 className="text-lg font-semibold">📊 Analytics Overview</h2>
          <p className="mt-2 text-gray-600">More detailed charts coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
