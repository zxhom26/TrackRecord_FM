"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
  sendTokenToBackend,
  fetchAudioFeatures,
  fetchTopTracks,
} from "../../utils";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

// ---------- TYPES ----------
interface SpotifyArtist {
  name: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  external_urls: { spotify: string };
}

interface AudioFeature {
  energy: number;
  danceability: number;
  valence: number;
  acousticness: number;
  tempo: number;
}

export default function MoodPage() {
  const { data: session } = useSession();

  const [moodStats, setMoodStats] = useState<null | any>(null);

  async function analyzeMood() {
    if (!session?.accessToken) {
      console.log("❌ No access token found in session.");
      return;
    }

    console.log("🎫 Access token:", session.accessToken);

    // Sync token with backend (important)
    await sendTokenToBackend(session.accessToken);

    // 1. Fetch top tracks
    const topRes = await fetchTopTracks(session.accessToken);
    console.log("🔍 Top Tracks Response:", topRes);

    const tracks: SpotifyTrack[] = topRes?.spotify_data?.items || [];

    if (!tracks.length) {
      alert("No top tracks available.");
      return;
    }

    console.log("🎵 Tracks returned:", tracks);

    // 2. Extract track IDs (with explicit typing)
    const trackIds = tracks
      .map((t: SpotifyTrack) => t?.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    console.log("🆔 Track IDs:", trackIds);

    if (!trackIds.length) {
      alert("Error: No valid track IDs.");
      return;
    }

    // 3. Fetch audio features
    const featuresRes = await fetchAudioFeatures(session.accessToken, trackIds);
    console.log("🎧 Audio Features Response:", featuresRes);

    const features: AudioFeature[] = featuresRes?.audio_features || [];

    if (!features.length) {
      alert("No audio features available.");
      return;
    }

    console.log("🎛️ Parsed audio features:", features);

    // 4. Compute mood stats
    const mood = computeMoodStats(features);
    console.log("🧠 Mood Stats:", mood);

    setMoodStats(mood);
  }

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
