"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
  sendTokenToBackend,
  fetchAudioFeatures,
  fetchTopTracks,
} from "../../utils";

// Recharts
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

// ---------- TYPES ----------
interface AudioFeature {
  energy: number;
  valence: number;
  danceability: number;
  acousticness: number;
  tempo: number;
}

interface SpotifyArtist {
  name: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  external_urls: { spotify: string };
}

export default function MoodPage() {
  const { data: session } = useSession();

  const [audioData, setAudioData] = useState<AudioFeature[] | null>(null);
  const [moodStats, setMoodStats] = useState<any>(null);

  // -----------------------------------------------------------
  // MAIN BUTTON LOGIC
  // -----------------------------------------------------------

  async function analyzeMood() {
    if (!session?.accessToken) return;

    // Send token to backend
    await sendTokenToBackend(session.accessToken);

    // Fetch top tracks
    const topRes = await fetchTopTracks(session.accessToken);
    const tracks: SpotifyTrack[] = topRes?.spotify_data?.items || [];

    if (tracks.length === 0) {
      alert("No top tracks available.");
      return;
    }

    const trackIds = tracks.map((t) => t.id);

    // Fetch audio features for those tracks
    const featuresRes = await fetchAudioFeatures(
      session.accessToken,
      trackIds
    );

    // Handle different possible backend shapes
    const rawFeatures: AudioFeature[] =
      featuresRes?.audio_features ||
      featuresRes?.features ||
      featuresRes?.spotify_data?.audio_features ||
      [];

    // Filter out invalid entries
    const features = rawFeatures.filter(
      (f) =>
        f &&
        typeof f.energy === "number" &&
        typeof f.valence === "number" &&
        typeof f.danceability === "number" &&
        typeof f.acousticness === "number" &&
        typeof f.tempo === "number"
    );

    console.log("USABLE FEATURES:", features);

    if (features.length === 0) {
      alert("Could not load audio features.");
      return;
    }

    setAudioData(features);

    // Compute mood stats
    const mood = computeMoodStats(features);
    setMoodStats(mood);
  }

  // -----------------------------------------------------------
  // MOOD CALCULATIONS
  // -----------------------------------------------------------

  function computeMoodStats(features: AudioFeature[]) {
    const avg = (arr: number[]) =>
      arr.reduce((a, b) => a + b, 0) / arr.length;

    const energy = avg(features.map((f) => f.energy));
    const dance = avg(features.map((f) => f.danceability));
    const valence = avg(features.map((f) => f.valence));
    const acoustic = avg(features.map((f) => f.acousticness));
    const tempo = avg(features.map((f) => f.tempo));

    const vibe = classifyMood(energy, valence, dance, acoustic);

    return {
      energy,
      danceability: dance,
      happiness: valence,
      acousticness: acoustic,
      tempo,
      vibe,
    };
  }

  function classifyMood(
    energy: number,
    valence: number,
    dance: number,
    acoustic: number
  ) {
    if (energy > 0.7 && valence > 0.6) return "✨ Upbeat & Happy";
    if (energy > 0.7 && valence < 0.4) return "🔥 Intense & Emotional";
    if (energy < 0.5 && acoustic > 0.5) return "🌿 Calm & Acoustic";
    return "🎧 Balanced Vibes";
  }

  // -----------------------------------------------------------
  // UI
  // -----------------------------------------------------------

  return (
    <main
      style={{
        padding: "40px",
        fontFamily: "Inter, sans-serif",
        background: "linear-gradient(135deg, #8A4FFF, #E454FF)",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", fontWeight: 700 }}>
        Your <span style={{ color: "#FFD96A" }}>Mood Profile</span>
      </h1>

      <button
        onClick={analyzeMood}
        style={{
          marginTop: "20px",
          background: "#FFD96A",
          color: "#4A1F7A",
          padding: "14px 28px",
          borderRadius: "25px",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
        }}
      >
        Analyze My Music Mood
      </button>

      {/* Mood Summary */}
      {moodStats && (
        <div
          style={{
            marginTop: "30px",
            padding: "25px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(6px)",
          }}
        >
          <h2 style={{ marginBottom: "10px" }}>{moodStats.vibe}</h2>
          <p>Energy: {(moodStats.energy * 100).toFixed(0)}%</p>
          <p>Danceability: {(moodStats.danceability * 100).toFixed(0)}%</p>
          <p>Happiness: {(moodStats.happiness * 100).toFixed(0)}%</p>
          <p>Acousticness: {(moodStats.acousticness * 100).toFixed(0)}%</p>
          <p>Tempo: {moodStats.tempo.toFixed(0)} BPM</p>
        </div>
      )}

      {/* Radar Chart */}
      {moodStats && (
        <div style={{ height: "350px", marginTop: "40px" }}>
          <ResponsiveContainer>
            <RadarChart
              data={[
                { metric: "Energy", value: moodStats.energy },
                { metric: "Danceability", value: moodStats.danceability },
                { metric: "Happiness", value: moodStats.happiness },
                { metric: "Acousticness", value: moodStats.acousticness },
              ]}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={30} domain={[0, 1]} />
              <Radar
                dataKey="value"
                stroke="#FFD96A"
                fill="#FFD96A"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </main>
  );
}
