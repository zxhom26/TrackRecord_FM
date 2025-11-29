"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Home, MessagesSquare, Trophy, Settings, User, ListMusic } from "lucide-react";
import { sendTokenToBackend } from "../utils";

// ───────────────────── TYPES ─────────────────────
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

// ───────────────────── COMPONENT ─────────────────────

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  // send token to backend
  useEffect(() => {
    if (session?.accessToken) {
      sendTokenToBackend(session); // MODIFIED THIS TO SEND WHOLE SESSION OBJECT
    }
  }, [session?.accessToken]);

  const displayName =
    session?.user?.email || session?.user?.name || "Spotify User";

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

        {/* ---------------- ICON NAV ---------------- */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            marginTop: "8px",
          }}
        >
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
            <Home size={24} color="#dccbf2" />
          </div>

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
            <MessagesSquare size={24} color="#dccbf2" />
          </div>

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
            <Trophy size={24} color="#dccbf2" />
          </div>

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
            <Settings size={24} color="#dccbf2" />
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
            backgroundColor: "#1a1233",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 30px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ width: 40 }} />

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

        {/* ------- TOP BUTTON ------- */}
        <section style={{ textAlign: "center", marginTop: "10px" }}>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            Dive Back In to Your Favorites…
          </h2>

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

        {/* ==================================================== */}
        {/*              UPDATED 3-PANEL DASHBOARD               */}
        {/* ==================================================== */}

        <section
          style={{
            marginTop: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {/* 1 — QUICK STATS */}
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
                marginBottom: "10px",
              }}
            >
              Quick Stats
            </h3>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: "0.92rem",
                lineHeight: 1.5,
                opacity: 0.85,
              }}
            >
              <li>• Total Artists Analyzed: —</li>
              <li>• Most Common Genre: —</li>
              <li>• Average Popularity: —</li>
            </ul>
          </div>

          {/* 2 — ANALYTICS */}
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
                marginBottom: "10px",
              }}
            >
              Analytics
            </h3>

            <p
              style={{
                fontSize: "0.9rem",
                opacity: 0.8,
                lineHeight: 1.4,
              }}
            >
              Listening trends and patterns will appear here soon.
            </p>
          </div>

          {/* 3 — MOOD PROFILE */}
          <div
            style={{
              borderRadius: "18px",
              padding: "18px 20px",
              background: "linear-gradient(135deg,#fff2e5,#ffd7b8)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "10px",
              }}
            >
              Mood Profile
            </h3>

            <p
              style={{
                fontSize: "0.9rem",
                opacity: 0.8,
                marginBottom: "14px",
              }}
            >
              Discover your unique listening mood.
            </p>

            <div style={{ fontSize: "2rem", marginBottom: "16px" }}>🎧</div>

            <button
              onClick={() => router.push("/mood")}
              style={{
                marginTop: "auto",
                padding: "10px 16px",
                background: "linear-gradient(135deg,#a160ff,#ff985c)",
                border: "none",
                borderRadius: "10px",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem",
                boxShadow: "0 5px 12px rgba(0,0,0,0.15)",
              }}
            >
              View Mood Profile
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
