import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import WebTorrent from "webtorrent";
import axios from "axios";
import { Download } from "lucide-react";

const EpisodeDetail = () => {
  const { id, seasonNumber, episodeNumber } = useParams();
  const apiKey = "688fd03556ed51e7944c50c4783c6023";

  const [episode, setEpisode] = useState(null);
  const [seriesTitle, setSeriesTitle] = useState("");
  const [imdbId, setImdbId] = useState(null);
  const [ezTorrents, setEzTorrents] = useState([]);
  const [watching, setWatching] = useState(false);
  const videoRef = useRef(null);
  const clientRef = useRef(null);

  useEffect(() => {
    const fetchEpisodeAndImdb = async () => {
      try {
        // Fetch episode details
        const epRes = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${apiKey}&language=en-US`
        );
        const epData = await epRes.json();
        setEpisode(epData);

        // Fetch series info & IMDb ID
        const seriesRes = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`
        );
        const seriesData = await seriesRes.json();
        setSeriesTitle(seriesData.name);

        // Fetch external IDs to get IMDb ID
        const externalRes = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/external_ids?api_key=${apiKey}`
        );
        const externalData = await externalRes.json();
        setImdbId(externalData.imdb_id);
      } catch (err) {
        console.error("Error fetching episode or IMDb ID", err);
      }
    };

    fetchEpisodeAndImdb();

    return () => {
      if (clientRef.current) {
        clientRef.current.destroy();
        clientRef.current = null;
      }
    };
  }, [id, seasonNumber, episodeNumber]);

  // Fetch EZTV torrents once we have IMDb ID
  useEffect(() => {
    if (!imdbId) return;

    const fetchEZTVTorrents = async () => {
      try {
        const res = await axios.get(
          `https://eztv.re/api/get-torrents?imdb_id=${imdbId}`
        );

        if (res.data && res.data.torrents) {
          // Filter torrents for the current season and episode
          const filtered = res.data.torrents.filter(
            (torrent) =>
              parseInt(torrent.season) === parseInt(seasonNumber) &&
              parseInt(torrent.episode) === parseInt(episodeNumber)
          );
          setEzTorrents(filtered);
        }
      } catch (err) {
        console.error("Error fetching EZTV torrents", err);
      }
    };

    fetchEZTVTorrents();
  }, [imdbId, seasonNumber, episodeNumber]);

  // Start streaming with WebTorrent
  const startStreaming = (magnetURI) => {
    if (clientRef.current) {
      clientRef.current.destroy();
      clientRef.current = null;
    }

    const client = new WebTorrent();
    clientRef.current = client;

    client.add(magnetURI, (torrent) => {
      const file = torrent.files.find((file) =>
        file.name.endsWith(".mp4") || file.name.endsWith(".mkv") || file.name.endsWith(".webm")
      );

      if (file && videoRef.current) {
        file.renderTo(videoRef.current, {
          autoplay: true,
          controls: true,
        });
      }
    });
  };

  if (!episode) {
    return <p style={{ color: "white", padding: "2rem" }}>Loading episode info...</p>;
  }

  return (
    <div style={{ padding: "2rem", color: "white" }}>
      <h1>
        {seriesTitle} - Season {seasonNumber} Episode {episodeNumber}: {episode.name}
      </h1>
      <p>{episode.overview}</p>
      <p><strong>Air Date:</strong> {episode.air_date}</p>
      <p><strong>Runtime:</strong> {episode.runtime || "N/A"} minutes</p>

      {ezTorrents.length > 0 ? (
        <>
          {ezTorrents.map((torrent) => {
            const magnetLink = `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(
              torrent.title
            )}&tr=udp://tracker.openbittorrent.com:80`;

            return (
              <div key={torrent.torrent_id} style={{ marginBottom: "1rem" }}>
                <a
                  href={magnetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-button"
                  style={{ marginRight: "1rem" }}
                >
                  <Download size={20} /> Download {torrent.quality} ({torrent.size})
                </a>
                <button
                  className="watch-button"
                  onClick={() => {
                    setWatching(true);
                    startStreaming(magnetLink);
                  }}
                  style={{ padding: "0.5rem 1rem" }}
                >
                  Watch {torrent.quality}
                </button>
              </div>
            );
          })}
        </>
      ) : (
        <p style={{ color: "yellow" }}>
          No EZTV torrents available for this episode.
        </p>
      )}

      {watching && (
        <div
          className="video-modal"
          onClick={() => {
            setWatching(false);
            if (clientRef.current) {
              clientRef.current.destroy();
              clientRef.current = null;
            }
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <video
            ref={videoRef}
            controls
            style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "8px" }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => {
              setWatching(false);
              if (clientRef.current) {
                clientRef.current.destroy();
                clientRef.current = null;
              }
            }}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              backgroundColor: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              cursor: "pointer",
            }}
            aria-label="Close video"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default EpisodeDetail;
