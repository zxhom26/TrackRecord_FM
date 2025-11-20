"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Home, MessagesSquare, Trophy, Settings, User, ListMusic } from "lucide-react";
import { sendTokenToBackend } from "../utils";

// ───────────────────── TYPES (for future expansion) ─────────────────────
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

// ───────────────────────── COMPONENT ─────────────────────────

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  // send token to backend when available
  useEffect(() => {
    if (session?.accessToken) {
      sendTokenToBackend(session.accessToken);
    }
  }, [session?.accessToken]);

  const displayName =
    session?.user?.email ||
    session?.user?.name ||
    "Spotify User";

  const handleGoToTopTracks = () => {
    router.push("/top-tracks");
  };

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
          padding: "16px 10px 24px 10px",
          background: "#1a1233",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "40px",
        }}
      >
        {/* ----- WAVEFORM TOP LEFT ----- */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginTop: "0px",
            marginBottom: "10px",
          }}
        >
          <svg
            width="120"
            height="180"
            viewBox="0 0 400 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Play circle */}
            <circle cx="60" cy="80" r="40" fill="url(#grad)" />
            <polygon points="50,60 50,100 80,80" fill="white" />

            {/* Left bars */}
            <rect x="130" y="50" width="20" height="80" rx="10" fill="url(#grad)" />
            <rect x="170" y="60" width="20" height="60" rx="10" fill="url(#grad)" />

            {/* Center tall bars */}
            <rect x="210" y="30" width="20" height="120" rx="10" fill="url(#grad)" />
            <rect x="250" y="45" width="20" height="90" rx="10" fill="url(#grad)" />
            <rect x="290" y="35" width="20" height="110" rx="10" fill="url(#grad)" />

            {/* Right decreasing bars */}
            <rect x="330" y="55" width="20" height="70" rx="10" fill="url(#grad)" />
            <rect x="370" y="70" width="20" height="40" rx="10" fill="url(#grad)" />

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
            gap: "28px",
            marginTop: "8px",
          }}
        >
          {/* HOME */}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: "rgba(106, 86, 194, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Home size={24} color="#6A56C2" />
          </div>

          {/* SOCIAL */}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: "rgba(106, 86, 194, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MessagesSquare size={24} color="#6A56C2" />
          </div>

          {/* TROPHY */}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: "rgba(106, 86, 194, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trophy size={24} color="#6A56C2" />
          </div>

          {/* SETTINGS */}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: "rgba(106, 86, 194, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Settings size={24} color="#6A56C2" />
          </div>
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main
        style={{
          flexGrow: 1,
          padding: "30px 40px 40px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* ------- TOP BAR ------- */}
        <header
  style={{
    width: "100%",
    height: "70px",
    backgroundColor: "rgba(43, 34, 90, 1)", // full opaque dark purple
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 30px",
    borderRadius: 0, // removes the pill shape
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  }}
>
  {/* Left spacer to visually align text with sidebar */}
  <div style={{ width: 40 }} />

  {/* Gradient Welcome Text */}
  <div
    style={{
      fontSize: "1.6rem",
      fontWeight: 700,
      backgroundImage: "linear-gradient(135deg,#a160ff,#ff985c)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      textAlign: "center",
      flexGrow: 1,
    }}
  >
    Welcome back, {displayName}!
  </div>

  {/* Profile Icon */}
  <div
    style={{
      width: 42,
      height: 42,
      borderRadius: "50%",
      backgroundColor: "#d9c9ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <User size={22} color="#2b225a" />
  </div>
</header>


        {/* ------- “Dive Back In” HEADING ------- */}
        <section
          style={{
            textAlign: "center",
            marginTop: "10px",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            Dive Back In to Your Favorites…
          </h2>

          {/* OBLONG BUTTON WITH LUCIDE ICON */}
          <button
            onClick={handleGoToTopTracks}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.95rem",
              color: "#fff",
              backgroundImage: "linear-gradient(135deg,#a160ff,#ff985c)",
              boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
            }}
          >
            <ListMusic size={18} color="#ffffff" />
            Load Top Tracks
          </button>
        </section>

        {/* ------- 3 DASHBOARD PANELS (UI ONLY FOR NOW) ------- */}
        <section
          style={{
            marginTop: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Weekly Listening Analytics */}
          <div
            style={{
              borderRadius: "18px",
              padding: "18px 20px",
              background: "linear-gradient(135deg,#e8f5ff,#d2e5ff)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Weekly Listening
            </h3>
            <p
              style={{
                fontSize: "0.9rem",
                opacity: 0.8,
                marginBottom: "12px",
              }}
            >
              Minutes listened by day of week (coming soon).
            </p>
            <div
              style={{
                height: "120px",
                borderRadius: "12px",
                background:
                  "repeating-linear-gradient(90deg,#c8ddff 0px,#c8ddff 40px,#d9e7ff 40px,#d9e7ff 80px)",
              }}
            />
          </div>

          {/* Mood Diary */}
          <div
            style={{
              borderRadius: "18px",
              padding: "18px 20px",
              background: "linear-gradient(135deg,#f0e8ff,#d9caff)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Mood Diary
            </h3>
            <p
              style={{
                fontSize: "0.9rem",
                opacity: 0.8,
                marginBottom: "10px",
              }}
            >
              Jot down how you’re feeling as you listen.
            </p>
            <textarea
              placeholder="How are you feeling today?"
              style={{
                width: "100%",
                height: "90px",
                borderRadius: "10px",
                border: "none",
                padding: "10px",
                resize: "none",
                fontFamily: "inherit",
                fontSize: "0.9rem",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
              }}
            />
          </div>

          {/* Leaderboard Panel */}
          <div
            style={{
              borderRadius: "18px",
              padding: "18px 20px",
              background: "linear-gradient(135deg,#ffe9f0,#ffd4e1)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Leaderboard
            </h3>
            <p
              style={{
                fontSize: "0.9rem",
                opacity: 0.8,
                marginBottom: "10px",
              }}
            >
              Top artist & genre summaries (coming soon).
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: "0.9rem",
              }}
            >
              <li style={{ marginBottom: "6px" }}>• Top Artist: —</li>
              <li style={{ marginBottom: "6px" }}>• Top Genre: —</li>
              <li>• Most played day: —</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
