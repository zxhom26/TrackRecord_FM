"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { sendTokenToBackend, fetchDiscoverWeekly } from "../../utils";

import { Home, MessageSquare, Trophy, Settings } from "lucide-react";

// ---------- TYPES ----------
interface SpotifyArtist {
  name: string;
}

interface SpotifyTrack {
  name: string;
  artists: SpotifyArtist[];
  external_urls: { spotify: string };
}

export default function DiscoverPage() {
  const { data: session, status } = useSession();

  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Loading Discover Weekly…");

  // 🔥 Unified load handler (button + auto)
  async function handleLoad() {
    if (!session?.accessToken) {
      setMessage("No access token available.");
      return;
    }

    setLoading(true);
    setMessage("Loading Discover Weekly…");

    // 1. Sync token with backend
    const saved = await sendTokenToBackend(session.accessToken);
    if (!saved || saved.error) {
      setMessage("Error storing token. Try again.");
      setLoading(false);
      return;
    }

    // 2. Fetch Discover Weekly playlist
    const result = await fetchDiscoverWeekly(session.accessToken);
    const items = result?.discover_weekly?.items;

    if (!items) {
      setMessage("Spotify may not have generated your Discover Weekly yet.");
      setLoading(false);
      return;
    }

    setTracks(items);
    setMessage("");
    setLoading(false);
  }

  // ⏱ Auto-load with a slight delay to prevent race conditions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (status === "authenticated") {
      const timer = setTimeout(() => {
        handleLoad();
      }, 300); // 300ms delay prevents token timing issues

      return () => clearTimeout(timer);
    }
  }, [status]);

  const displayName =
    session?.user?.name || session?.user?.email || "Spotify User";

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
      {/* ---------- LEFT SIDEBAR ---------- */}
      <aside
        style={{
          width: "95px",
          padding: "16px 10px",
          backgroundColor: "#1a1233",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "40px",
        }}
      >
        <div style={{ marginTop: "0px" }}>
          <svg
            width="120"
            height="180"
            viewBox="0 0 400 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="60" cy="80" r="40" fill="url(#grad)" />
            <polygon points="50,60 50,100 80,80" fill="white" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a160ff" />
                <stop offset="100%" stopColor="#ff985c" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "30px",
          }}
        >
          <Home size={26} color="#d8cfff" />
          <MessageSquare size={26} color="#d8cfff" />
          <Trophy size={26} color="#d8cfff" />
          <Settings size={26} color="#d8cfff" />
        </nav>
      </aside>

      {/* ---------- MAIN CONTENT ---------- */}
      <main
        style={{
          flexGrow: 1,
          padding: "40px",
          color: "#2b225a",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "16px",
          }}
        >
          Discover Weekly for{" "}
          <span style={{ color: "#6A56C2" }}>{displayName}</span>
        </h1>

        {/* --- Reload button --- */}
        <button
          onClick={handleLoad}
          style={{
            background: "#6A56C2",
            color: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Reload Discover Weekly
        </button>

        {/* --- Messages --- */}
        {message && (
          <p style={{ opacity: 0.7, marginBottom: "20px" }}>{message}</p>
        )}

        {/* --- Loading state --- */}
        {loading && <p style={{ opacity: 0.7 }}>Fetching…</p>}

        {/* --- Tracks Grid --- */}
        {tracks.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            {tracks.map((track, i) => (
              <div
                key={i}
                style={{
                  background: "#e5daf5",
                  borderRadius: "14px",
                  padding: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontWeight: 700 }}>{track.name}</div>

                <div style={{ opacity: 0.7, marginTop: "4px" }}>
                  {track.artists.map((a) => a.name).join(", ")}
                </div>

                <a
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: "12px",
                    display: "inline-block",
                    background: "#1DB954",
                    padding: "8px 12px",
                    color: "white",
                    borderRadius: "18px",
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
    </div>
  );
}
