"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import {
  fetchTopArtists,
  fetchTopGenres,
  getQuickStats,
  sendTokenToBackend,
} from "../../utils.js";

import BarChartArtists from "./charts/BarChartArtists";
import LineChartMinutes from "./charts/LineChartMinutes";
import PieGenreChart from "./charts/PieGenreChart";

export default function DashboardPage() {
  const { data: session } = useSession();

  const [topArtists, setTopArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [listeningMinutes, setListeningMinutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // SEND TOKEN ON LOAD
  // ---------------------------
  useEffect(() => {
    if (session?.accessToken) {
      sendTokenToBackend(session.accessToken);
    }
  }, [session?.accessToken]);

  // ---------------------------
  // MAIN ANALYTICS LOADER
  // ---------------------------
  async function loadAnalytics() {
    if (!session?.accessToken) return;

    setLoading(true);
    const token = session.accessToken;

    try {
      console.log("📡 Fetching dashboard analytics (via utils.js)…");

      // FETCH
      const artistsRes = await fetchTopArtists(token);   // { top_artists: [...] }
      const genresRes = await fetchTopGenres(token);     // { top_genres: [...] }
      const quickRes = await fetchQuickStatsRaw(token);  // raw quickstats

      // -------------- FORMAT ARTISTS --------------
      // Backend DOES NOT send minutes → so we compute
      const formattedArtists = (artistsRes.top_artists || []).map((a, i) => ({
        name: a.name,
        minutes: Math.floor(Math.random() * 300) + 20 // temporary simulated values
      }));

      setTopArtists(formattedArtists);

      // -------------- FORMAT GENRES --------------
      const genreList = genresRes.top_genres || [];

      // Count frequencies
      const genreCounts = {};
      genreList.forEach((g) => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });

      const formattedGenres = Object.entries(genreCounts).map(
        ([name, value]) => ({ name, value })
      );

      setGenres(formattedGenres);

      // -------------- FORMAT MINUTES LISTENED --------------
      const minutesArr = quickRes.minutes_listened_by_day || [];

      // Convert raw array → chart format with fake dates
      const formattedMinutes = minutesArr.map((m, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (minutesArr.length - i)); // days backwards
        return {
          date: date.toISOString().split("T")[0],
          minutes: m,
        };
      });

      setListeningMinutes(formattedMinutes);

    } catch (err) {
      console.error("❌ Dashboard error:", err);
    }

    setLoading(false);
  }

  // QuickStats "raw" getter (returns backend shape)
  async function fetchQuickStatsRaw(token) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quick-stats`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token }),
      }
    );
    const json = await res.json();
    return json.quick_stats?.[0] || {};
  }

  // Trigger when token appears
  useEffect(() => {
    if (session?.accessToken) {
      loadAnalytics();
    }
  }, [session?.accessToken]);

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-4xl font-bold mb-4">Your Spotify Analytics</h1>

      {loading && <p>Loading analytics…</p>}

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


