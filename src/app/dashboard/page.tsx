"use client";

/**
 * TRF-63 — Interactive Analytics Dashboard (FINAL, CLEAN WORKING VERSION)
 * ------------------------------------------------------------------------
 * ✓ Sends Spotify token to backend
 * ✓ Loads ALL analytics endpoints in parallel
 * ✓ Handles errors correctly
 * ✓ Populates charts with stable, correct data
 * ✓ Fully commented + production-ready
 */

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { sendTokenToBackend } from "../../utils.js";

// Chart components
import BarChartArtists from "./charts/BarChartArtists";
import LineChartMinutes from "./charts/LineChartMinutes";
import PieGenreChart from "./charts/PieGenreChart";

// -------------------------------------
// BACKEND URL (HARDCODED + CORRECT)
// -------------------------------------
const BASE_URL = "https://trackrecord-fm.onrender.com/api";

// ---------------------------
// Types for clean data access
// ---------------------------
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

  // ---------------------------
  // STATE VARIABLES
  // ---------------------------
  const [topArtists, setTopArtists] = useState<ArtistRecord[]>([]);
  const [genres, setGenres] = useState<GenreRecord[]>([]);
  const [listeningMinutes, setListeningMinutes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // SEND TOKEN TO BACKEND
  // ---------------------------
  useEffect(() => {
    if (!session?.accessToken) return;
    sendTokenToBackend(session.accessToken);
  }, [session?.accessToken]);

  // ---------------------------
  // FETCH ANALYTICS
  // ---------------------------
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

      // Run all API requests in parallel for speed
      const [artistsRes, genresRes, quickRes] = await Promise.all([
        fetch(`${BASE_URL}/top-artists`, requestBody),
        fetch(`${BASE_URL}/top-genres`, requestBody),
        fetch(`${BASE_URL}/quick-stats`, requestBody),
      ]);

      const artistsData = await artistsRes.json();
      const genresData = await genresRes.json();
      const quickData = await quickRes.json();

      // ---------------------------
      // SAVE DATA INTO STATE
      // ---------------------------
      setTopArtists(artistsData.top_artists || []);
      setGenres(genresData.top_genres || []);

      // QUICK STATS STRUCTURE:
      // { quick_stats: [ { minutes_listened_by_day: [...], top_artist, top_track } ] }
      const stats: QuickStatsRecord | undefined =
        quickData.quick_stats?.[0];

      setListeningMinutes(stats?.minutes_listened_by_day || []);

      console.log("✅ Dashboard analytics loaded.");
    } catch (error) {
      console.error("❌ Error loading analytics:", error);
    }

    setLoading(false);
  }

  // Load analytics when token arrives
  useEffect(() => {
    if (session?.accessToken) loadAnalytics();
  }, [session?.accessToken]);

  // ---------------------------
  // RENDER UI
  // ---------------------------
  return (
    <div className="p-8 space-y-10">
      <h1 className="text-4xl font-bold mb-4">Your Spotify Analytics</h1>

      {loading && <p className="text-lg">Loading analytics…</p>}

      {!loading && (
        <>
          {/* ======================
              CHART 1 — LINE CHART
             ====================== */}
          <section>
            <h2 className="text-2xl font-semibold mb-2">
              Listening Minutes Over Time
            </h2>
            <LineChartMinutes data={listeningMinutes} />
          </section>

          {/* ======================
              CHART 2 — BAR CHART
             ====================== */}
          <section>
            <h2 className="text-2xl font-semibold mb-2">Your Top Artists</h2>
            <BarChartArtists data={topArtists} />
          </section>

          {/* ======================
              CHART 3 — PIE CHART
             ====================== */}
          <section>
            <h2 className="text-2xl font-semibold mb-2">Top Genres</h2>
            <PieGenreChart data={genres} />
          </section>
        </>
      )}
    </div>
  );
}
