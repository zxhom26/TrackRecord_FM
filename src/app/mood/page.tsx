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

export default function MoodPage() {
  const { data: session } = useSession();

  const [moodStats, setMoodStats] = useState(null);

  async function analyzeMood() {
    if (!session?.accessToken) return;

    await sendTokenToBackend(session.accessToken);

    // 1. Get top tracks
    const topRes = await fetchTopTracks(session.accessToken);
    const tracks = topRes?.spotify_data?.items || [];

    console.log("Tracks returned:", tracks);

    const trackIds = tracks
      .map((t) => t?.id)
      .filter((id) => typeof id === "string" && id.length > 0);

    console.log("Track IDs:", trackIds);

    if (trackIds.length === 0) {
      alert("❌ No valid track IDs found.");
      return;
    }

    // 2. Get audio features
    const featuresRes = await fetchAudioFeatures(
      session.accessToken,
      trackIds
    );

    const features = featuresRes?.audio_features?.filter(Boolean) || [];

    console.log("Audio features returned:", features);

    if (features.length === 0) {
      alert("❌ Audio features not returned by Spotify.");
      return;
    }

    // 3. Compute mood stats
    setMoodStats(computeMoodStats(features));
  }

  function computeMoodStats(features) {
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

    return {
      energy: avg(features.map((f) => f.energy)),
      danceability: avg(features.map((f) => f.danceability)),
      happiness: avg(features.map((f) => f.valence)),
      acousticness: avg(features.map((f) => f.acousticness)),
      tempo: avg(features.map((f) => f.tempo)),
      vibe: classifyMood(
        avg(features.map((f) => f.energy)),
        avg(features.map((f) => f.valence)),
        avg(features.map((f) => f.danceability)),
        avg(features.map((f) => f.acousticness))
      ),
    };
  }

  function classifyMood(energy, valence, dance, acoustic) {
    if (energy > 0.7 && valence > 0.6) return "✨ Upbeat & Happy";
    if (energy > 0.7 && valence < 0.4) return "🔥 Intense & Emotional";
    if (energy < 0.5 && acoustic > 0.5) return "🌿 Calm & Acoustic";
    return "🎧 Balanced Vibes";
  }

  return (
    <main style={{ padding: "40px", color: "white" }}>
      <h1>Your Mood Profile</h1>

      <button onClick={analyzeMood}>Analyze My Music Mood</button>

      {moodStats && (
        <div>
          <h2>{moodStats.vibe}</h2>
          <p>Energy: {(moodStats.energy * 100).toFixed(0)}%</p>
          <p>Danceability: {(moodStats.danceability * 100).toFixed(0)}%</p>
          <p>Happiness: {(moodStats.happiness * 100).toFixed(0)}%</p>
          <p>Acousticness: {(moodStats.acousticness * 100).toFixed(0)}%</p>
          <p>Tempo: {moodStats.tempo.toFixed(0)} BPM</p>
        </div>
      )}

      {moodStats && (
        <div style={{ height: "350px" }}>
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
              <Radar dataKey="value" stroke="#FFD96A" fill="#FFD96A" />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </main>
  );
}
