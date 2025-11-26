"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { sendTokenToBackend, fetchDiscoverWeekly } from "../../utils";

export default function DiscoverPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Loading Discover Weekly…");

  // ------------ Auto-load with safe timing ------------
  useEffect(() => {
    if (status !== "authenticated") return;

    // Small delay: allows Render warm-up & token registration
    const timer = setTimeout(() => {
      handleLoad();
    }, 300);

    return () => clearTimeout(timer);
  }, [status]);

  // ------------ Unified load handler (button + auto) ------------
  async function handleLoad() {
    if (!session?.accessToken) {
      setMessage("No access token.");
      return;
    }

    setLoading(true);
    setMessage("Loading Discover Weekly…");

    // 1. Send token to backend
    const stored = await sendTokenToBackend(session.accessToken);

    if (!stored || stored.error) {
      setLoading(false);
      setMessage("Error storing token. Try again.");
      return;
    }

    // 2. Fetch Discover Weekly
    const result = await fetchDiscoverWeekly(session.accessToken);

    const items = result?.discover_weekly?.items;
    if (!items) {
      setLoading(false);
      setMessage("Spotify may not have generated your Discover Weekly yet.");
      return;
    }

    setTracks(items);
    setLoading(false);
    setMessage("");
  }

  const displayName =
    session?.user?.email || session?.user?.name || "Spotify User";

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "16px" }}>
        Discover Weekly for{" "}
        <span style={{ color: "#6A56C2" }}>{displayName}</span>
      </h1>

      {/* --- Manual Reload Button --- */}
      <button
        onClick={handleLoad}
        style={{
          background: "#6A56C2",
          color: "white",
          padding: "10px 16px",
          borderRadius: "8px",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        Reload Discover Weekly
      </button>

      {/* --- Loading / Error Message --- */}
      {message && (
        <p style={{ opacity: 0.7, marginBottom: "20px" }}>{message}</p>
      )}

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
    </div>
  );
}
