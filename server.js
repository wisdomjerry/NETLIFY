// server.js
import express from 'express';
import axios from 'axios';
import cors from 'cors'; // Required for handling Cross-Origin Resource Sharing
const app = express();
const port = 3001; // You can choose any available port

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// --- EZTV Proxy Endpoint ---
app.get('/api/eztv-torrents', async (req, res) => {
    // Extract query parameters from the frontend request
    const { imdb_id, seasonNumber, episodeNumber } = req.query;

    console.log(`[EZTV Proxy] Received request for IMDb ID: ${imdb_id}, S${seasonNumber}E${episodeNumber}`); // DEBUG LOG

    if (!imdb_id) {
        return res.status(400).json({ status: 'error', message: 'IMDb ID is required.' });
    }

    try {
        const eztvApiUrl = `https://eztv.re/api/get-torrents?imdb_id=${imdb_id}`;
        console.log(`[EZTV Proxy] Proxying request to EZTV: ${eztvApiUrl}`); // DEBUG LOG

        const eztvRes = await axios.get(eztvApiUrl);

        // DEBUG LOG: Log the raw data received from EZTV API
        console.log('[EZTV Proxy] Raw EZTV API Response Data (first 5 torrents):', 
            eztvRes.data.torrents ? eztvRes.data.torrents.slice(0, 5).map(t => ({
                title: t.title,
                season: t.season,
                episode: t.episode,
                hash: t.hash
            })) : 'No torrents array or empty');

        if (eztvRes.data && eztvRes.data.torrents) {
            let filteredTorrents = eztvRes.data.torrents;

            // If season and episode numbers are provided, filter the torrents
            if (seasonNumber && episodeNumber) {
                filteredTorrents = eztvRes.data.torrents.filter(
                    (torrent) => {
                        const torrentSeason = parseInt(torrent.season);
                        const torrentEpisode = parseInt(torrent.episode);
                        const requestedSeason = parseInt(seasonNumber);
                        const requestedEpisode = parseInt(episodeNumber);

                        const match = torrentSeason === requestedSeason && torrentEpisode === requestedEpisode;
                        
                        // DEBUG LOG: Log each torrent's season/episode and whether it matches
                        // console.log(`  Checking torrent '${torrent.title}': S${torrent.season}E${torrent.episode} vs S${seasonNumber}E${episodeNumber} = ${match}`); 
                        
                        return match;
                    }
                );
            }

            // DEBUG LOG: Log the count of torrents after filtering
            console.log(`[EZTV Proxy] Filtered torrents count: ${filteredTorrents.length}`); 

            // Send the filtered torrents back to the frontend
            res.json({ status: 'success', torrents: filteredTorrents });
        } else {
            res.json({ status: 'success', torrents: [], message: 'No torrents found for this series on EZTV.' });
        }
    } catch (error) {
        console.error('[EZTV Proxy] Error proxying EZTV request:', error.message);
        // Log more details if it's an Axios error
        if (error.response) {
            console.error('[EZTV Proxy] EZTV API response error status:', error.response.status);
            console.error('[EZTV Proxy] EZTV API response error data:', error.response.data);
        } else if (error.request) {
            console.error('[EZTV Proxy] EZTV API request error:', error.request);
        }
        res.status(500).json({ status: 'error', message: 'Failed to fetch torrents from EZTV.' });
    }
});


// --- The Pirate Bay (TPB) Proxy Endpoint (Kept commented out for reference) ---
/*
app.get('/api/tpb-torrents', async (req, res) => {
    const { searchQuery, seasonNumber, episodeNumber } = req.query;

    console.log(`[TPB Proxy] Received request for search query: "${searchQuery}" (S${seasonNumber}E${episodeNumber})`);

    if (!searchQuery) {
        return res.status(400).json({ status: 'error', message: 'Search query is required.' });
    }

    try {
        const tpbApiUrl = `https://apibay.org/q.php?q=${encodeURIComponent(searchQuery)}`;
        console.log(`[TPB Proxy] Proxying request to TPB: ${tpbApiUrl}`);

        const tpbRes = await axios.get(tpbApiUrl);

        const rawTorrents = tpbRes.data;
        const validTorrents = Array.isArray(rawTorrents) ? rawTorrents.filter(t => t.name && t.info_hash) : [];

        console.log('[TPB Proxy] Raw TPB API Response Data (first 5 torrents):',
            validTorrents.slice(0, 5).map(t => ({
                name: t.name,
                size: t.size,
                seeders: t.seeders,
                leechers: t.leechers
            })) || 'No valid torrents in response');

        let filteredTorrents = [];

        if (validTorrents.length > 0 && seasonNumber && episodeNumber) {
            const sNum = parseInt(seasonNumber);
            const eNum = parseInt(episodeNumber);

            const episodeRegex = new RegExp(
                `S0*${sNum}E0*${eNum}|S${sNum}\\.E${eNum}`, 
                'i' 
            );

            filteredTorrents = validTorrents.filter(torrent => {
                const torrentName = torrent.name;
                const matchesEpisode = episodeRegex.test(torrentName);
                return matchesEpisode;
            });
        } else if (validTorrents.length > 0 && !seasonNumber && !episodeNumber) {
            filteredTorrents = validTorrents;
        }

        console.log(`[TPB Proxy] Filtered torrents count: ${filteredTorrents.length}`);

        const formattedTorrents = filteredTorrents.map(torrent => ({
            torrent_id: torrent.id, 
            title: torrent.name,
            magnet_url: `magnet:?xt=urn:btih:${torrent.info_hash}&dn=${encodeURIComponent(torrent.name)}&tr=udp://tracker.openbittorrent.com:80`, 
            torrent_url: `https://apibay.org/torrent/${torrent.id}`, 
            size: torrent.size, 
            seeders: torrent.seeders,
            leechers: torrent.leechers,
            season: seasonNumber, 
            episode: episodeNumber, 
            quality: (torrent.name.match(/(\d{3,4}p)/i) || ['N/A'])[0] 
        }));

        res.json({ status: 'success', torrents: formattedTorrents });

    } catch (error) {
        console.error('[TPB Proxy] Error proxying TPB request:', error.message);
        if (error.response) {
            console.error('[TPB Proxy] TPB API response error status:', error.response.status);
            console.error('[TPB Proxy] TPB API response error data:', error.response.data);
        } else if (error.request) {
            console.error('[TPB Proxy] TPB API request error:', error.request);
        }
        res.status(500).json({ status: 'error', message: 'Failed to fetch torrents from The Pirate Bay.' });
    }
});
*/

// Start the server
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
    console.log('Remember to start this server before running your React app for torrent functionality.');
});
