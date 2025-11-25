"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { sendTokenToBackend, fetchTopTracks } from "../../utils";

interface SpotifyArtist {
  name: string;
}

interface SpotifyTrack {
  name: string;
  artists: SpotifyArtist[];
  external_urls: { spotify: string };
}

interface SpotifyResponse {
  spotify_data?: {
    items: SpotifyTrack[];
  };
}

export default function TopTracksPage() {
  const { data: session } = useSession();
  const [tracks, setTracks] = useState<SpotifyResponse | null>(null);

  // Send token to backend if available
  useEffect(() => {
    if (session?.accessToken) {
      sendTokenToBackend(session.accessToken);
    }
  }, [session?.accessToken]);

  async function loadTracks() {
    if (!session?.accessToken) return;

    const result = await fetchTopTracks(session.accessToken);
    setTracks(result);
  }

  const username =
    session?.user?.email ||
    session?.user?.name ||
    "Spotify User";

  return (
    <main
      style={{
        padding: "40px",
        fontFamily: "Inter, sans-serif",
        background: "linear-gradient(135deg,#e8defa,#d0bcf5)",
        minHeight: "100vh",
        color: "#2b225a",
      }}
    >
      {/* Header */}
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: "10px",
        }}
      >
        Your Top Tracks, <span style={{ color: "#6A56C2" }}>{username}</span>
      </h1>

      {/* Load Button */}
      <button
        onClick={loadTracks}
        style={{
          padding: "12px 24px",
          background: "#6A56C2",
          color: "white",
          borderRadius: "25px",
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Load Top Tracks
      </button>

      {/* Track Cards */}
      {tracks?.spotify_data?.items && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
            gap: "20px",
          }}
        >
          {tracks.spotify_data.items.slice(0, 20).map((track, index) => (
            <div
              key={index}
              style={{
                background: "white",
                borderRadius: "14px",
                padding: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                minHeight: "140px",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                {index + 1}. {track.name}
              </div>
              <div style={{ marginTop: "6px", color: "#555" }}>
                {track.artists.map((a) => a.name).join(", ")}
              </div>
              <a
                href={track.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: "12px",
                  display: "inline-block",
                  padding: "8px 12px",
                  background: "#1DB954",
                  color: "white",
                  borderRadius: "20px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                Open →
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
