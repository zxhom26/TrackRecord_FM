"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { fetchTopArtists, getTopMoodsFromGenres } from "../../utils";

interface TopArtist {
  name: string;
  genres: string[];
}

export default function MoodPage() {
  const { data: session } = useSession();
  const [result, setResult] = useState<any>(null);
  const [mood, setMood] = useState<string>("");
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!session?.accessToken) {
      alert("No access token found.");
      return;
    }

    setLoading(true);
    setMood("");
    setGenres([]);
    setResult(null);

    console.log("🎫 Access Token:", session.accessToken);

    const response = await fetchTopArtists(session.accessToken);
    console.log("🔍 Top Artists JSON:", response);

    setResult(response);

    const items: TopArtist[] = response?.spotify_data?.items ?? [];

    if (items.length === 0) {
      setMood("No top artists available.");
      setLoading(false);
      return;
    }

    // Gather ALL genres from all top artists
    const allGenres = items.flatMap((artist: TopArtist) => artist.genres ?? []);
    console.log("🎨 ALL GENRES:", allGenres);

    setGenres(allGenres);

    // Compute Top 3 Mood Profile
    const topMoods = getTopMoodsFromGenres(allGenres);
    setMood(topMoods.join(" • "));

    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
        🎵 Your Mood Profile
      </h1>

      <button
        onClick={handleFetch}
        disabled={loading}
        style={{
          padding: "12px 20px",
          background: "#1DB954",
          border: "none",
          borderRadius: "8px",
          color: "white",
          cursor: "pointer",
          fontSize: "1rem",
          fontWeight: 600,
        }}
      >
        {loading ? "Loading..." : "Generate Mood Profile"}
      </button>

      {/* --- Mood Result --- */}
      {mood && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.2rem",
            borderRadius: "12px",
            background: "#f4f4f4",
          }}
        >
          <h2 style={{ fontSize: "1.4rem", fontWeight: 600 }}>Your Top Moods:</h2>
          <p style={{ fontSize: "1.2rem", marginTop: "0.5rem" }}>{mood}</p>
        </div>
      )}

      {/* --- Genre List --- */}
      {genres.length > 0 && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "#fafafa",
            borderRadius: "10px",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem" }}>Genres Detected:</h3>
          <ul style={{ paddingLeft: "1.2rem" }}>
            {genres.map((g, i) => (
              <li key={i} style={{ marginBottom: "4px" }}>
                {g}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* --- Raw JSON Data (debug) --- */}
      <pre
        style={{
          background: "#f4f4f4",
          padding: "1rem",
          marginTop: "2rem",
          borderRadius: "8px",
          maxHeight: "350px",
          overflowY: "auto",
        }}
      >
        {result ? JSON.stringify(result, null, 2) : "No data yet..."}
      </pre>
    </div>
  );
}
