"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { sendTokenToBackend, fetchAudioFeatures, fetchTopTracks } from "../../utils";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function MoodPage() {
  const { data: session } = useSession();

  const [audioData, setAudioData] = useState(null);
  const [moodStats, setMoodStats] = useState(null);

  async function analyzeMood() {
    if (!session?.accessToken) return;

    // Sync token with backend
    await sendTokenToBackend(session.accessToken);

    // 1. Fetch user's top 20 tracks (last 4 weeks)
    const topRes = await fetchTopTracks(session.accessToken, "short_term");
    const tracks = topRes?.spotify_data?.items || [];

    if (tracks.length === 0) {
      alert("No top tracks available.");
      return;
    }

    const trackIds = tracks.map((t) => t.id);

    // 2. Fetch audio features for these tracks
    const featuresRes = await fetchAudioFeatures(session.accessToken, trackIds);
    const features = featuresRes?.audio_features || [];

    setAudioData(features);

    // 3. Compute mood stats (frontend)
    const mood = computeMoodStats(features);
    setMoodStats(mood);
  }

  function computeMoodStats(features) {
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const energy = avg(features.map((f) => f.energy));
    const dance = avg(features.map((f) => f.danceability));
    const valence = avg(features.map((f) => f.valence));
    const acoustic = avg(features.map((f) => f.acousticness));
    const tempo = avg(features.map((f) => f.tempo));

    const vibe = classifyMood(energy, valence, dance);

    return {
      energy,
      danceability: dance,
      happiness: valence,
      acousticness: acoustic,
      tempo,
      vibe,
    };
  }

  function classifyMood(energy, valence, dance) {
    if (energy > 0.7 && valence > 0.6) return "✨ Upbeat & Happy";
    if (energy > 0.7 && valence < 0.4) return "🔥 Intense & Emotional";
    if (energy < 0.5 && acoustic > 0.5) return "🌿 Calm & Acoustic";
    return "🎧 Balanced Vibes";
  }

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

      {/* Mood Summary Card */}
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
