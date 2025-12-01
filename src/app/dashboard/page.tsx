"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import {
  fetchTopArtists,
  fetchTopGenres,
  getQuickStats,
  sendTokenToBackend,
} from "../../utils.js";

// Chart components
import BarChartArtists from "./charts/BarChartArtists";
import LineChartMinutes from "./charts/LineChartMinutes";
import PieGenreChart from "./charts/PieGenreChart";

export default function DashboardPage() {
  const { data: session } = useSession();

  // ---------------------------
  // STATE VARIABLES
  // ---------------------------
  const [topArtists, setTopArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [listeningMinutes, setListeningMinutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // SEND TOKEN TO BACKEND (required)
  // ---------------------------
  useEffect(() => {
    if (session?.accessToken) {
      sendTokenToBackend(session.accessToken);
    }
  }, [session?.accessToken]);

  // ---------------------------
  // LOAD ANALYTICS VIA utils.js
  // ---------------------------
  async function loadAnalytics() {
    if (!session?.accessToken) return;

    setLoading(true);
    const token = session.accessToken;

    try {
      console.log("📡 Fetching dashboard analytics (via utils.js)…");

      // 
      const artistsRes = await fetchTopArtists(token);
      const genresRes = await fetchTopGenres(token);
      const quickRes = await getQuickStats(token);

      // Save artists
      setTopArtists(artistsRes.top_artists || []);

      // Save genres
      setGenres(genresRes.top_genres || []);

      // Save listening minutes
      setListeningMinutes(
        quickRes?.minutes_listened_by_day || []
      );

    } catch (err) {
      console.error("❌ Dashboard error:", err);
    }

    setLoading(false);
  }

  // Call when token arrives
  useEffect(() => {
    if (session?.accessToken) {
      loadAnalytics();
    }
  }, [session?.accessToken]);

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="p-8 space-y-10">
      <h1 className="text-4xl font-bold mb-4">Your Spotify Analytics</h1>

      {loading && <p>Loading analytics…</p>}

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

