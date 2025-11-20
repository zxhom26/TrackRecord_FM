"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { sendTokenToBackend, fetchTopTracks } from "../utils";

// ---------- TYPES ----------
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

export default function Home() {
  const { data: session } = useSession();

  const [topTracks, setTopTracks] = useState<SpotifyResponse | null>(null);

  // ---------------- SEND TOKEN ----------------
  useEffect(() => {
    if (session?.accessToken) {
      sendTokenToBackend(session.accessToken);
    }
  }, [session?.accessToken]);

  // ---------------- FETCH TOP TRACKS ----------------
  async function handleFetchTopTracks() {
    if (!session?.accessToken) return;

    const result = await fetchTopTracks(session.accessToken);
    setTopTracks(result);
  }

  // username fallback
  const displayName =
    session?.user?.email ||
    session?.user?.name ||
    "Spotify User";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
        background: "linear-gradient(135deg,#e8defa,#d0bcf5)",
        color: "#2b225a",
      }}
    >
      {/* ================= LEFT SIDEBAR ================= */}
      <aside
        style={{
          width: "95px",
          padding: "25px 10px",
          background: "rgba(0,0,0,0.15)",
          backdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "50px",
        }}
      >
        {/* ----- BIGGER WAVEFORM ----- */}
        <svg width="85" height="140" viewBox="0 0 400 140">
          <circle cx="30" cy="70" r="25" fill="url(#grad)" />
          <polygon points="25,55 25,85 48,70" fill="white" />

          <rect x="80" y="35" width="14" height="70" rx="7" fill="url(#grad)" />
          <rect x="110" y="50" width="14" height="40" rx="7" fill="url(#grad)" />
          <rect x="140" y="25" width="14" height="90" rx="7" fill="url(#grad)" />
          <rect x="170" y="55" width="14" height="30" rx="7" fill="url(#grad)" />
          <rect x="200" y="45" width="14" height="50" rx="7" fill="url(#grad)" />

          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a160ff" />
              <stop offset="100%" stopColor="#ff985c" />
            </linearGradient>
          </defs>
        </svg>

        {/* ---------------- ICON NAV ---------------- */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "35px",
          }}
        >
          {/* HOME */}
          <svg width="38" height="38" viewBox="0 0 24 24" fill="#6A56C2">
            <path d="M12 3l9 7h-3v11H6V10H3l9-7z" />
          </svg>

          {/* SOCIAL */}
          <svg width="38" height="38" viewBox="0 0 24 24" fill="#6A56C2">
            <path d="M4 4h16v12H6l-2 2V4zm3 4v2h10V8H7zm0 4v2h7v-2H7z" />
          </svg>

          {/* TROPHY */}
          <svg width="38" height="38" viewBox="0 0 24 24" fill="#6A56C2">
            <path d="M17 3v2h3v3a4 4 0 01-4 4h-1a6 6 0 01-4 2 6 6 0 01-4-2H6a4 4 0 01-4-4V5h3V3h12z" />
          </svg>

          {/* SETTINGS */}
          <svg width="38" height="38" viewBox="0 0 24 24" fill="#6A56C2">
            <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9 4a7 7 0 00-.2-1.6l2-1.5-2-3.5-2.4 1a6.9 6.9 0 00-1.7-1L16.5 2h-5L10 5.4a6.9 6.9 0 00-1.7 1l-2.4-1-2 3.5 2 1.5A7 7 0 006 12c0 .6.1 1.1.2 1.6l-2 1.5 2 3.5 2.4-1c.5.4 1.1.8 1.7 1L11.5 22h5l.5-3.4c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.5-2-1.5c.1-.5.2-1 .2-1.6z" />
          </svg>
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main
        style={{
          flexGrow: 1,
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          gap: "25px",
        }}
      >
        {/* ------- USERNAME ------- */}
        <div style={{ fontSize: "2rem", fontWeight: 700 }}>
          Welcome back,{" "}
          <span style={{ color: "#6A56C2" }}>{displayName}</span>!
        </div>

        {/* ------- TITLE ------- */}
        <h2 style={{ fontSize: "1.6rem", fontWeight: 600, marginBottom: "-10px" }}>
          Your Top Tracks
        </h2>

        {/* ------- REFRESH BUTTON UNDER TITLE ------- */}
        <button
          onClick={handleFetchTopTracks}
          style={{
            padding: "10px 20px",
            width: "130px",
            borderRadius: "8px",
            backgroundColor: "#6a56c2",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            border: "none",
            marginBottom: "15px",
          }}
        >
          Refresh
        </button>

        {/* ------- TOP TRACK CARDS ------- */}
        {topTracks?.spotify_data?.items && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "15px",
              width: "70%",
              minWidth: "600px",
            }}
          >
            {topTracks.spotify_data.items.slice(0, 10).map((track, index) => (
              <div
                key={index}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "15px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  height: "120px",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                  {index + 1}. {track.name}
                </div>

                <div
                  style={{ marginTop: "6px", color: "#555", fontSize: "0.9rem" }}
                >
                  {track.artists.map((a) => a.name).join(", ")}
                </div>

                <a
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: "10px",
                    display: "inline-block",
                    padding: "6px 10px",
                    background: "#1DB954",
                    color: "white",
                    borderRadius: "14px",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}
                >
                  Open →
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
