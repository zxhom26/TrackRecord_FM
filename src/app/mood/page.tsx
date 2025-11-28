"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { fetchTopArtists } from "../../utils";

export default function MoodTestPage() {
  const { data: session } = useSession();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!session?.accessToken) {
      alert("No access token found.");
      return;
    }

    setLoading(true);
    setResult(null);

    console.log("🎫 Access Token:", session.accessToken);

    const response = await fetchTopArtists(session.accessToken);

    console.log("🔍 Top Artists JSON:", response);
    setResult(response);

    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🎵 Mood Test Page (Top Artists)</h1>

      {!session && (
        <p style={{ color: "red" }}>
          You must be logged in to test this.
        </p>
      )}

      <button
        onClick={handleFetch}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: "#1DB954",
          border: "none",
          borderRadius: "5px",
          color: "white",
          cursor: "pointer",
          marginTop: "1rem",
        }}
      >
        {loading ? "Loading..." : "Fetch Top Artists"}
      </button>

      <pre
        style={{
          background: "#f4f4f4",
          padding: "1rem",
          marginTop: "2rem",
          borderRadius: "6px",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {result ? JSON.stringify(result, null, 2) : "No data yet..."}
      </pre>
    </div>
  );
}
