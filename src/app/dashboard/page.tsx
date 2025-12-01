
"use client";

/**
 * TRF-63 — Interactive Analytics Dashboard
 * -----------------------------------------
 * ✔ Sends Spotify access token → backend
 * ✔ Fetches ALL analytics endpoints (parallel)
 * ✔ Renders 3 charts (Artists, Minutes, Genres)
 * ✔ Clean state, clean UI, no unused variables
 * ✔ Fully commented + production ready
 */

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { sendTokenToBackend } from "../../utils.js";

// Chart components
import BarChartArtists from "./charts/BarChartArtists";
import LineChartMinutes from "./charts/LineChartMinutes";
import PieGenreChart from "./charts/PieGenreChart";

export default function DashboardPage() {
  const { data: session } = useSession();

  // ------------------------------
  // ANALYTICS STATE
  // ------------------------------
  const [topArtists, setTopArtists] = useState([]);
  const [listeningMinutes, setListeningMinutes] = useState([]);
  const [genres, setGenres] = useState([]);

  // Backend API URL
  const BASE_URL = "https://trackrecord-fm.onrender.com";




  // ------------------------------
  // SEND TOKEN TO BACKEND
  // ------------------------------
  useEffect(() => {
    if (!session?.accessToken) return;
    sendTokenToBackend(session.accessToken);
  }, [session?.accessToken]);

  // ------------------------------
  // LOAD ALL ANALYTICS
  // ------------------------------
  async function loadAnalytics() {
    if (!session?.accessToken) return;

    const tokenBody = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: session.accessToken }),
    };

    try {
      console.log("📡 Fetching dashboard analytics...");

      const [artistsRes, genresRes, quickRes] = await Promise.all([
        fetch(`${BASE_URL}/top-artists`, tokenBody),
        fetch(`${BASE_URL}/top-genres`, tokenBody),
        fetch(`${BASE_URL}/quick-stats`, tokenBody),
      ]);

      const artistsData = await artistsRes.json();
      const genresData = await genresRes.json();
      const quickData = await quickRes.json();

      // Save fields exactly how backend returns them
      setTopArtists(artistsData.top_artists || []);
      setGenres(genresData.top_genres || []);
      setListeningMinutes(
        quickData.quick_stats?.[0]?.minutes_listened_by_day || []
      );

      console.log("✅ Dashboard analytics loaded.");
    } catch (err) {
      console.error("❌ Error loading analytics:", err);
    }
  }

  // Fetch analytics on load
  useEffect(() => {
    if (session?.accessToken) loadAnalytics();
  }, [session?.accessToken]);

  // ------------------------------
  // UI RENDER
  // ------------------------------
  return (
    <div className="p-8 space-y-10">
      <h1 className="text-4xl font-bold mb-4">Your Spotify Analytics</h1>

      {/* ===== Chart 1 — Listening Minutes Over Time ===== */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Listening Minutes</h2>
        <LineChartMinutes data={listeningMinutes} />
      </section>

      {/* ===== Chart 2 — Your Top Artists ===== */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Top Artists</h2>
        <BarChartArtists data={topArtists} />
      </section>

      {/* ===== Chart 3 — Top Genres ===== */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Top Genres</h2>
        <PieGenreChart data={genres} />
      </section>
    </div>
  );
}
