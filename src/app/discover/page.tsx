"use client";

import React, { useState, useEffect } from "react";
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

interface DiscoverWeekResponse {
  discover_weekly?: {
    items: SpotifyTrack[];
  };
}

export default function DiscoverPage() {
  const { data: session } = useSession();

  const [tracks, setTracks] = useState<SpotifyTrack[] | null>(null);

  // Send token to backend if available (IDENTICAL TO TOP TRACKS LOGIC)
  useEffect(() => {
    if (session?.accessToken) {
      sendTokenToBackend(session.accessToken);
    }
  }, [session?.accessToken]);

  // Load Discover Weekly ONLY when user presses button
  async function loadDiscoverWeekly() {
    if (!session?.accessToken) return;

    const result: DiscoverWeekResponse = await fetchDiscoverWeekly(
      session.accessToken
    );

    const items = result?.discover_weekly?.items || [];
    setTracks(items);
  }

  const username =
    session?.user?.email || session?.user?.name || "Spotify User";

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
          <span style={{ color: "#6A56C2" }}>{username}</span>
        </h1>

        {/* --- Load Button (IDENTICAL BEHAVIOR TO TOP TRACKS) --- */}
        <button
          onClick={loadDiscoverWeekly}
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
          Load Discover Weekly
        </button>

        {/* --- Track Cards Grid --- */}
        {tracks && tracks.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: "20px",
            }}
          >
            {tracks.map((track, index) => (
              <div
                key={index}
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

        {tracks && tracks.length === 0 && (
          <p style={{ opacity: 0.7 }}>
            Spotify may not have generated your Discover Weekly yet.
          </p>
        )}
      </main>
    </div>
  );
}
