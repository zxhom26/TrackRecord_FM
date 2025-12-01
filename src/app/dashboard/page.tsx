"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { sendTokenToBackend } from "../../utils.js";

import BarChartArtists from "./charts/BarChartArtists";
import LineChartMinutes from "./charts/LineChartMinutes";
import PieGenreChart from "./charts/PieGenreChart";

// Correct BASE_URL
const BASE_URL = "https://trackrecord-fm.onrender.com";

// Types
interface ArtistRecord {
  name: string;
  genres: string[];
}

interface GenreRecord {
  genre: string;
}

interface QuickStatsRecord {
  minutes_listened_by_day: number[];
  top_artist: string;
  top_track: string;
  top_genre: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();

  const [topArtists, setTopArtists] = useState<ArtistRecord[]>([]);
  const [genres, setGenres] = useState<GenreRecord[]>([]);
  const [listeningMinutes, setListeningMinutes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Send token to backend
  useEffect(() => {
    if (!session?.accessToken) return;
    sendTokenToBackend(session.accessToken);
  }, [session?.accessToken]);

  // Fetch dashboard analytics
  async function loadAnalytics() {
    if (!session?.accessToken) return;

    setLoading(true);

    const requestBody = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: session.accessToken }),
    };

    try {
      console.log("📡 Fetching dashboard analytics...");

      const [artistsRes, genresRes, quickRes] = await Promise.all([
        fetch(`${BASE_URL}/api/top-artists`, requestBody),
        fetch(`${BASE_URL}/api/top-genres`, requestBody),
        fetch(`${BASE_URL}/api/quick-stats`, requestBody),
      ]);

      const artistsData = await artistsRes.json();
      const genresData = await genresRes.json();
      const quickData = await quickRes.json();

      setTopArtists(artistsData.top_artists || []);
      setGenres(genresData.top_genres || []);

      const stats: QuickStatsRecord | undefined =
        quickData.quick_stats?.[0];

      setListeningMinutes(stats?.minutes_listened_by_day || []);

      console.log("✅ Dashboard analytics loaded.");
    } catch (err) {
      console.error("❌ Error loading analytics:", err);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (session?.accessToken) loadAnalytics();
  }, [session?.accessToken]);

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-4xl font-bold mb-4">Your Spotify Analytics</h1>

      {loading && <p className="text-lg">Loading analytics...</p>}

      {!loading && (
        <>
          <section>
            <h2 className="text-2xl font-semibold mb-2">
              Listening Minutes Over Time
            </h2>
            <LineChartMinutes data={listeningMinutes} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Your Top Artists</h2>
            <BarChartArtists data={topArtists} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Top Genres</h2>
            <PieGenreChart data={genres} />
          </section>
        </>
      )}
    </div>
  );
}

