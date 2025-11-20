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

  // ---------------- SEND TOKEN TO BACKEND ----------------
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

  // ───────────────────────────────────────────────
  //                   UI RETURN
  // ───────────────────────────────────────────────

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
          width: "90px",
          padding: "20px 10px",
          background: "rgba(0,0,0,0.15)",
          backdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "40px",
        }}
      >
        {/* WAVEFORM ICON */}
        <svg width="60" height="120" viewBox="0 0 400 120">
          <circle cx="30" cy="60" r="22" fill="url(#grad)" />
          <polygon points="25,48 25,72 45,60" fill="#ffffff" />

          <rect x="70" y="30" width="10" height="60" rx="5" fill="url(#grad)" />
          <rect x="90" y="40" width="10" height="40" rx="5" fill="url(#grad)" />
          <rect x="110" y="20" width="10" height="80" rx="5" fill="url(#grad)" />
          <rect x="130" y="45" width="10" height="30" rx="5" fill="url(#grad)" />

          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a160ff" />
              <stop offset="100%" stopColor="#ff985c" />
            </linearGradient>
          </defs>
        </svg>

        {/* ICONS (SVG ONLY—NO INSTALLS) */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          {/* HOME ICON */}
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#ffffffbb">
            <path d="M12 3l8 6v12H4V9l8-6z" />
          </svg>

          {/* SOCIAL FEED ICON */}
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#ffffffbb">
            <path d="M4 4h16v12H5.17L4 17.17V4m2 2v8h12V6H6z" />
          </svg>

          {/* TROPHY ICON */}
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#ffffffbb">
            <path d="M6 3v2H4v4a4 4 0 004 4h1a6 6 0 004 2.68V21H9v2h6v-2h-4v-3.32A6 6 0 0015 13h1a4 4 0 004-4V5h-2V3H6z" />
          </svg>

          {/* SETTINGS ICON */}
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#ffffffbb">
            <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9.4 5a7.9 7.9 0 000-2l2.1-1.6-2-3.5-2.4 1a8 8 0 00-1.7-1l-.4-2.6H9l-.4 2.6a8 8 0 00-1.7 1l-2.4-1-2 3.5L4.6 11a7.9 7.9 0 000 2l-2.1 1.6 2 3.5 2.4-1a8 8 0 001.7 1l.4 2.6h6l.4-2.6a8 8 0 001.7-1l2.4 1 2-3.5L21.4 13z" />
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
          gap: "30px",
        }}
      >
        {/* ------- TOP BAR WITH USERNAME ------- */}
        <div
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          Welcome back,{" "}
          <span style={{ color: "#6a56c2" }}>
            {session?.user?.name || "Spotify User"}
          </span>
          !
        </div>

        {/* ------- TOP TRACKS TITLE + BUTTON ------- */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 600 }}>Your Top Tracks</h2>

          <button
            onClick={handleFetchTopTracks}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: "#6a56c2",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              border: "none",
            }}
          >
            Refresh
          </button>
        </div>

        {/* ------- TOP TRACK LIST (NO IMAGES) ------- */}
        {topTracks?.spotify_data?.items && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            {topTracks.spotify_data.items.map((track, index) => (
              <div
                key={index}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "18px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
                    padding: "8px 14px",
                    background: "#1DB954",
                    color: "white",
                    borderRadius: "20px",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Open on Spotify →
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
