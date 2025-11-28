"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { fetchTopArtists, getMoodFromGenres } from "../../utils";

export default function MoodTestPage() {
  const { data: session } = useSession();
  const [result, setResult] = useState(null);
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!session?.accessToken) {
      alert("No access token found.");
      return;
    }

    setLoading(true);
    setResult(null);
    setMood("");

    console.log("🎫 Access Token:", session.accessToken);

    const response = await fetchTopArtists(session.accessToken);

    console.log("🔍 Top Artists JSON:", response);
    setResult(response);

    const items = response?.spotify_data?.items || [];

    if (items.length === 0) {
      setMood("No top artists available.");
      setLoading(false);
      return;
    }

    // Gather all genres from all top artists
    const allGenres = items.flatMap((artist) => artist.genres ?? []);
    console.log("🎨 ALL GENRES:", allGenres);

    // Convert genres → mood
    const derivedMood = getMoodFromGenres(allGenres);
    setMood(derivedMood);

    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🎵 Mood Test Page (Genre Mood)</h1>

      <button
        onClick={handleFetch}
        disabled={loading}
        style={{
          padding: "12px 20px",
          background: "#1DB954",
          border: "none",
          borderRadius: "5px",
          color: "white",
          cursor: "pointer",
          marginTop: "1rem",
        }}
      >
        {loading ? "Loading..." : "Get My Mood"}
      </button>

      {mood && (
        <h2 style={{ marginTop: "2rem", fontSize: "1.5rem" }}>
          Your Mood: {mood}
        </h2>
      )}

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
