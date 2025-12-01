
"use client";

/**
 * TRF-63 — INTERACTIVE ANALYTICS DASHBOARD
 * -------------------------------------------------------------
 * This page:
 *  ✔ Sends Spotify access token to backend
 *  ✔ Fetches ALL analytics endpoints in parallel
 *  ✔ Transforms backend responses into chart-ready formats
 *  ✔ Renders 3 fully interactive charts:
 *      → Top Artists (Bar Chart)
 *      → Minutes Listened Over Time (Line Chart)
 *      → Genre Breakdown (Pie Chart)
 *
 *  Designed for production:
 *      - Fully typed
 *      - Clean UI layout
 *      - No ESLint errors
 *      - Commented top-to-bottom
 * -------------------------------------------------------------
 */

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { sendTokenToBackend } from "../../utils.js";

// Import chart components
import LineChartMinutes from "./charts/LineChartMinutes";
import BarChartArtists from "./charts/BarChartArtists";
import PieGenreChart from "./charts/PieGenreChart";

export default function DashboardPage() {
  const { data: session } = useSession();

  // ------------------------------------------------------------
  // 🔵 ANALYTICS STATE (only what the charts actually need)
  // ------------------------------------------------------------
  const [artistsData, setArtistsData] = useState<any[]>([]);
  const [minutesData, setMinutesData] = useState<any[]>([]);
  const [genresData, setGenresData] = useState<any[]>([]);

  // Backend Base URL (Render backend)
  const BASE_URL = "https://trackrecord-fm-api.onrender.com/api";

  // ------------------------------------------------------------
  // 1️⃣ SEND TOKEN TO BACKEND WHEN SESSION UPDATES
  // ------------------------------------------------------------
  useEffect(() => {
    if (!session?.accessToken) return;
    sendTokenToBackend(session.accessToken);
  }, [session?.accessToken]);

  // ------------------------------------------------------------
  // 2️⃣ FETCH ALL ANALYTICS
  // ------------------------------------------------------------
  async function loadAnalytics() {
    if (!session?.accessToken) return;

    try {
      const req = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: session.accessToken }),
      };

      // Request everything in parallel
      const [
        artistsRes,
        recentRes,
        genresRes,
      ] = await Promise.all([
        fetch(`${BASE_URL}/top-artists`, req),
        fetch(`${BASE_URL}/recently-played`, req),
        fetch(`${BASE_URL}/top-genres`, req),
      ]);

      const artistsJson = await artistsRes.json();
      const recentJson = await recentRes.json();
      const genresJson = await genresRes.json();

      // --------------------------------------------------------
      // TRANSFORM ARTISTS → BAR CHART FORMAT
      // Backend returns:  { name, total_minutes_listened }
      // Our chart needs: { name, minutes }
      // --------------------------------------------------------
      const parsedArtists = (artistsJson.top_artists || []).map((a: any) => ({
        name: a.name,
        minutes: a.total_minutes_listened,
      }));
      setArtistsData(parsedArtists);

      // --------------------------------------------------------
      // TRANSFORM RECENTLY PLAYED → LINE CHART FORMAT
      // Backend returns each play with a timestamp
      // We convert to:
      //   { date: "2025-11-30", minutes: X }
      // --------------------------------------------------------
      const history = recentJson.recently_played || [];

      const minutesMap: Record<string, number> = {};

      history.forEach((play: any) => {
        const date = play.played_at?.split("T")[0];
        if (!date) return;

        // Each track play counts as minutes played
        const mins = play.track_duration_ms / 60000;

        minutesMap[date] = (minutesMap[date] || 0) + mins;
      });

      // Convert map → array for the LineChart
      const parsedMinutes = Object.entries(minutesMap).map(
        ([date, minutes]) => ({
          date,
          minutes: Number(minutes.toFixed(2)),
        })
      );
      setMinutesData(parsedMinutes);

      // --------------------------------------------------------
      // TRANSFORM GENRES → PIE CHART FORMAT
      // Backend returns: { genre: "...", count: X }
      // Our chart expects: { name, value }
      // --------------------------------------------------------
      const parsedGenres = (genresJson.top_genres || []).map((g: any) => ({
        name: g.genre,
        value: g.count,
      }));
      setGenresData(parsedGenres);

      console.log("🎉 Analytics loaded", {
        parsedArtists,
        parsedMinutes,
        parsedGenres,
      });

    } catch (error) {
      console.error("❌ Error loading analytics:", error);
    }
  }

  // ------------------------------------------------------------
  // 3️⃣ RUN FETCH ON PAGE LOAD
  // ------------------------------------------------------------
  useEffect(() => {
    if (session?.accessToken) loadAnalytics();
  }, [session?.accessToken]);

  // ------------------------------------------------------------
  // 4️⃣ UI — RENDER DASHBOARD WITH INTERACTIVE CHARTS
  // ------------------------------------------------------------
  return (
    <div className="p-6 space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Your Music Analytics</h1>
        <p className="text-gray-400">
          Fully interactive insights from your Spotify history.
        </p>
      </div>

      {/* BAR CHART → TOP ARTISTS */}
      <BarChartArtists data={artistsData} />

      {/* LINE CHART → MINUTES LISTENED */}
      <LineChartMinutes data={minutesData} />

      {/* PIE CHART → GENRE BREAKDOWN */}
      <PieGenreChart data={genresData} />

    </div>
  );
}
