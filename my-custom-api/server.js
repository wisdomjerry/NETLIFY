// server.js
import express from 'express';
import axios from 'axios';
import cors from 'cors'; // For Cross-Origin Resource Sharing
import dotenv from 'dotenv'; // To load environment variables from .env file

// Load environment variables from .env file (e.g., for API keys, if you add them later)
dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // Use port from environment variable or default to 3001

// Enable CORS for all routes. This is crucial for your frontend to communicate with this API.
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// --- API Endpoint: Fetch TV Series Torrents ---
// This endpoint will be your custom API's way to get torrents for TV episodes.
// It currently proxies requests to EZTV.
app.get('/api/series/torrents', async (req, res) => {
    const { imdb_id, seasonNumber, episodeNumber } = req.query;

    console.log(`[Custom API] Received request for IMDb ID: ${imdb_id}, S${seasonNumber}E${episodeNumber}`);

    if (!imdb_id) {
        return res.status(400).json({ status: 'error', message: 'IMDb ID is required.' });
    }

    try {
        // --- Integration with EZTV API ---
        // This is where you integrate with external torrent sources.
        // For now, we're using EZTV. You can add more sources here (e.g., TPB, 1337x)
        // and combine their results, or prioritize one over another.
        const eztvApiUrl = `https://eztv.re/api/get-torrents?imdb_id=${imdb_id}`;
        console.log(`[Custom API] Proxying request to EZTV: ${eztvApiUrl}`);

        const eztvRes = await axios.get(eztvApiUrl);

        let torrents = [];
        if (eztvRes.data && eztvRes.data.torrents) {
            // Filter torrents for the specific season and episode
            torrents = eztvRes.data.torrents.filter(
                (torrent) => {
                    const torrentSeason = parseInt(torrent.season);
                    const torrentEpisode = parseInt(torrent.episode);
                    const requestedSeason = parseInt(seasonNumber);
                    const requestedEpisode = parseInt(episodeNumber);
                    return torrentSeason === requestedSeason && torrentEpisode === requestedEpisode;
                }
            );
        }

        console.log(`[Custom API] Found ${torrents.length} torrents from EZTV after filtering.`);

        // You can add more logic here:
        // - Combine results from multiple sources (e.g., if EZTV returns nothing, try TPB)
        // - Sort torrents (e.g., by seeders, quality)
        // - Cache results in memory or a database for faster future access

        // Send the filtered and processed torrents back to the frontend
        res.json({ status: 'success', torrents: torrents });

    } catch (error) {
        console.error('[Custom API] Error fetching torrents:', error.message);
        if (error.response) {
            console.error('[Custom API] External API response error status:', error.response.status);
            console.error('[Custom API] External API response error data:', error.response.data);
        } else if (error.request) {
            console.error('[Custom API] External API request error:', error.request);
        }
        res.status(500).json({ status: 'error', message: 'Failed to fetch torrents from external sources.' });
    }
});

// --- Other API Endpoints (Future Expansion) ---
// You could add more endpoints here for:
// - Movie torrents (e.g., /api/movies/torrents?imdb_id=...)
// - Search functionality (e.g., /api/search?query=...)
// - User authentication (if you build a user system)
// - Database interactions

// Start the server
app.listen(port, () => {
    console.log(`Your custom backend API listening at http://localhost:${port}`);
    console.log('Remember to start this server before running your React app.');
});
