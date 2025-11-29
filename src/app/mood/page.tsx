"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { fetchTopArtists, getTopMoodsFromGenres } from "../../utils";

// ---------- TYPES ----------
interface SpotifyArtist {
  name: string;
  genres: string[];
}

interface SpotifyTopArtistResponse {
  spotify_data?: {
    items: SpotifyArtist[];
  };
}

export default function MoodPage() {
  const { data: session } = useSession();

  const [result, setResult] =
    useState<SpotifyTopArtistResponse | null>(null);

  const [mood, setMood] = useState<string>("");
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // ---------- MAIN FUNCTION ----------
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

    const items: SpotifyArtist[] =
      response?.spotify_data?.items ?? [];

    if (items.length === 0) {
      setMood("No top artists available.");
      setLoading(false);
      return;
    }

    // Collect all genres
    const allGenres: string[] = items.flatMap(
      (artist: SpotifyArtist) => artist.genres ?? []
    );

    console.log("🎨 ALL GENRES:", allGenres);

    // Compute top 3 moods
    const topThreeMoods = getTopMoodsFromGenres(allGenres);
    console.log("🏆 TOP 3 MOODS:", topThreeMoods);

    setMood(topThreeMoods.join(", "));
    setGenres(allGenres);

    setLoading(false);
  };

  // ---------- UI ----------
  return (
    <div style={{ padding: "2rem", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        🎵 Your Mood Profile
      </h1>

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
          fontWeight: 600,
        }}
      >
        {loading ? "Loading..." : "Get My Mood Profile"}
      </button>

      {mood && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>
            🧠 Top Mood Signals:
          </h2>
          <p style={{ fontSize: "1.2rem" }}>{mood}</p>
        </div>
      )}

      {genres.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
            🎨 Genres Detected:
          </h3>
          <pre
            style={{
              background: "#f7f7f7",
              padding: "1rem",
              borderRadius: "6px",
            }}
          >
            {JSON.stringify(genres, null, 2)}
          </pre>
        </div>
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
        {result ? JSON.stringify(result, null, 2) : "— No data yet —"}
      </pre>
    </div>
  );
}
