"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardPage() {
  // ---------------- STATE ----------------
  const [minutesByDate, setMinutesByDate] = useState([]);
  const [artistTotals, setArtistTotals] = useState([]);
  const [genreTotals, setGenreTotals] = useState([]);

  // ---------------- DEBUG LOGGING ----------------
  useEffect(() => {
    console.log("🔥 minutesByDate:", minutesByDate);
    console.log("🔥 artistTotals:", artistTotals);
    console.log("🔥 genreTotals:", genreTotals);
  }, [minutesByDate, artistTotals, genreTotals]);

  // ---------------- FETCH ANALYTICS ----------------
  useEffect(() => {
    async function loadDashboard() {
      console.log("📡 loading analytics...");

      try {
        // Fetch from REAL backend routes
        const [
          playedRes,
          artistsRes,
          genresRes
        ] = await Promise.all([
          fetch("https://trackrecord-fm.onrender.com/recently-played"),
          fetch("https://trackrecord-fm.onrender.com/top-artists"),
          fetch("https://trackrecord-fm.onrender.com/genres")
        ]);

        const played = await playedRes.json();
        const artists = await artistsRes.json();
        const genres = await genresRes.json();

        console.log("📊 Loaded:", { played, artists, genres });

        // -----------------------------
        // FORMAT DATA FOR THE CHARTS
        // -----------------------------

        const minutesData =
  played?.items?.map((item: any) => ({
    date: item.played_at?.slice(0, 10),
    minutes: Math.floor(item.track?.duration_ms / 60000),
  })) || [];
setMinutesByDate(minutesData);

// ---- BAR CHART ----
const artistsData =
  artists?.items?.map((artist: any) => ({
    artist: artist.name,
    minutes: artist.total_minutes
      ? artist.total_minutes
      : artist.popularity || 0,
  })) || [];
setArtistTotals(artistsData);

// ---- PIE CHART ----
const genreData = Object.entries(genres?.genre_counts || {}).map(
  ([genre, count]: any) => ({
    genre,
    minutes: count,
  })
);
setGenreTotals(genreData);
  // ---------------- COLORS FOR PIE ----------------
  const COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#B76CFD", "#FF914D"];

  return (
    <div className="p-6 space-y-12">
      <h1 className="text-4xl font-bold mb-10">Your Listening Analytics 🎧</h1>

      {/* ---------------- LINE CHART ---------------- */}
      <section className="p-6 rounded-2xl shadow-md border bg-white">
        <h2 className="text-2xl font-semibold mb-4">
          Minutes Listened (Daily / Weekly / Monthly)
        </h2>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={minutesByDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="minutes"
              stroke="#4D96FF"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* ---------------- BAR CHART ---------------- */}
      <section className="p-6 rounded-2xl shadow-md border bg-white">
        <h2 className="text-2xl font-semibold mb-4">
          Top Artists by Minutes Streamed
        </h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={artistTotals}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="artist" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="minutes" fill="#6BCB77" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* ---------------- PIE CHART ---------------- */}
      <section className="p-6 rounded-2xl shadow-md border bg-white">
        <h2 className="text-2xl font-semibold mb-4">Genres You Listen To</h2>

        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie
              data={genreTotals}
              dataKey="minutes"
              nameKey="genre"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            >
              {genreTotals.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
