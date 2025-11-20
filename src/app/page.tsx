"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { sendTokenToBackend, fetchTopTracks } from "../utils";

// LUCIDE ICONS
import {
  House,
  MessagesSquare,
  Trophy,
  Settings,
} from "lucide-react";

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
          background: "rgba(0,0,0,0)",
          backdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "50px",
        }}
      >
        {/* -----  WAVEFORM (TOP-LEFT) ----- */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginTop: "0px", // moved higher
            marginBottom: "10px",
          }}
        >
          <svg
            width="120"
            height="220"
            viewBox="0 0 400 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Play circle */}
            <circle cx="60" cy="100" r="40" fill="url(#grad)" />
            <polygon points="50,80 50,120 80,100" fill="white" />

            {/* Left bars */}
            <rect x="130" y="60" width="20" height="80" rx="10" fill="url(#grad)" />
            <rect x="170" y="70" width="20" height="60" rx="10" fill="url(#grad)" />

            {/* Center tall bars */}
            <rect x="210" y="40" width="20" height="120" rx="10" fill="url(#grad)" />
            <rect x="250" y="55" width="20" height="90" rx="10" fill="url(#grad)" />
            <rect x="290" y="45" width="20" height="110" rx="10" fill="url(#grad)" />

            {/* Right decreasing bars */}
            <rect x="330" y="65" width="20" height="70" rx="10" fill="url(#grad)" />
            <rect x="370" y="80" width="20" height="40" rx="10" fill="url(#grad)" />

            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a160ff" />
                <stop offset="100%" stopColor="#ff985c" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* ---------------- ICON NAV (LUCIDE) ---------------- */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "35px",
          }}
        >
          <House size={38} color="#6A56C2" strokeWidth={2.4} />
          <MessagesSquare size={38} color="#6A56C2" strokeWidth={2.4} />
          <Trophy size={38} color="#6A56C2" strokeWidth={2.4} />
          <Settings size={38} color="#6A56C2" strokeWidth={2.4} />
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
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "18px",
              width: "90%",
              maxWidth: "1200px",
            }}
          >
            {topTracks.spotify_data.items.slice(0, 10).map((track, index) => (
              <div
                key={index}
                style={{
                  background: "#e5daf5",
                  borderRadius: "14px",
                  padding: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "140px",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                  {index + 1}. {track.name}
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    color: "#555",
                    fontSize: "0.9rem",
                    lineHeight: "1.3",
                  }}
                >
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
                    alignSelf: "flex-start",
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
