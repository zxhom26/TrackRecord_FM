
"use client";

/**
 * TRF-62 — BACKEND ANALYTICS FETCHER (DEBUG PAGE ONLY)
 * ----------------------------------------------------
 * ✔ Sends Spotify access token → backend POST /api/token
 * ✔ Fetches ALL analytics endpoints (POST) with same token
 * ✔ Stores ONLY correct response fields from backend
 * ✔ Recently Played endpoint corrected: /recently-played
 */

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { sendTokenToBackend } from "../../utils.js";

export default function DashboardPage() {
  const { data: session } = useSession();

  // --------------------------------------------------
  // STATE FOR ANALYTICS
  // --------------------------------------------------
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [genres, setGenres] = useState([]);
  const [quickStats, setQuickStats] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Backend URL — this MUST point to Render backend
  const BASE_URL = "https://trackrecord-fm-api.onrender.com/api";

  // --------------------------------------------------
  // 1) SEND TOKEN TO BACKEND
  // --------------------------------------------------
  useEffect(() => {
    if (!session?.accessToken) return;

    console.log("Sending access token to backend…");
    sendTokenToBackend(session.accessToken);
  }, [session?.accessToken]);

  // --------------------------------------------------
  // 2) FETCH ALL ANALYTICS IN PARALLEL
  // --------------------------------------------------
  async function loadAnalytics() {
    if (!session?.accessToken) return;

    try {
      console.log("📡 Fetching analytics…");

      const tokenBody = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: session.accessToken }),
      };

      // PARALLEL requests
      const [
        tracksRes,
        artistsRes,
        recentRes,
        genresRes,
        quickRes,
        recsRes,
      ] = await Promise.all([
        fetch(`${BASE_URL}/top-tracks`, tokenBody),
        fetch(`${BASE_URL}/top-artists`, tokenBody),
        fetch(`${BASE_URL}/recently-played`, tokenBody),   // ✔ MATCHES backend
        fetch(`${BASE_URL}/top-genres`, tokenBody),
        fetch(`${BASE_URL}/quick-stats`, tokenBody),
        fetch(`${BASE_URL}/recommendations`, tokenBody),
      ]);

      // Convert to JSON
      const tracksData = await tracksRes.json();
      const artistsData = await artistsRes.json();
      const recentData = await recentRes.json();
      const genresData = await genresRes.json();
      const quickData = await quickRes.json();
      const recsData = await recsRes.json();

      // --------------------------------------------------
      // SAVE RESPONSE FIELDS (MATCHES BACKEND EXACTLY)
      // --------------------------------------------------
      setTopTracks(tracksData.top_tracks || []);
      setTopArtists(artistsData.top_artists || []);
      setRecentlyPlayed(recentData.recently_played || []);
      setGenres(genresData.top_genres || []);
      setQuickStats(quickData.quick_stats?.[0] || null);
      setRecommendations(recsData.recommendations || []);

      console.log("✅ Analytics loaded successfully!");
      console.log({
        tracksData,
        artistsData,
        recentData,
        genresData,
        quickData,
        recsData,
      });
    } catch (err) {
      console.error("❌ Error loading analytics:", err);
    }
  }

  // --------------------------------------------------
  // 3) RUN ON PAGE LOAD
  // --------------------------------------------------
  useEffect(() => {
    if (session?.accessToken) loadAnalytics();
  }, [session?.accessToken]);

  // --------------------------------------------------
  // TRF-58 UI: DEBUG ONLY
  // --------------------------------------------------
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Analytics Loader (TRF-62)</h1>

      <p className="text-gray-500 mt-2">
        This page fetches analytics successfully.  
        Charts/UI will be built in <strong>TRF-63</strong>.
      </p>

      <div className="mt-6">
        <p className="text-gray-600">
          Open your browser console to see all analytics data.
        </p>
      </div>
    </div>
  );
}
