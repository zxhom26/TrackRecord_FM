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

  // ---------------- FETCH ANALYTICS ----------------
  useEffect(() => {
    async function loadDashboard() {
      console.log("📡 loading analytics...");

      const res = await fetch("https://trackrecord-fm.onrender.com/analytics");
      const data = await res.json();

      console.log("📊 Loaded:", data);

      // EXPECTED FORMAT:
      // data.minutesByDate = [{ date: "2025-01-01", minutes: 145 }, ...]
      // data.artistTotals = [{ artist: "Drake", minutes: 300 }, ...]
      // data.genreTotals = [{ genre: "Pop", minutes: 240 }, ...]

      setMinutesByDate(data.minutesByDate || []);
      setArtistTotals(data.artistTotals || []);
      setGenreTotals(data.genreTotals || []);
    }

    loadDashboard();
  }, []);


  // ---------------- COLORS FOR PIE ----------------
  const COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#B76CFD", "#FF914D"];

  return (
    <div className="p-6 space-y-12">
      <h1 className="text-4xl font-bold mb-10">Your Listening Analytics 🎧</h1>

      {/* ---------------- LINE CHART ---------------- */}
      <section className="p-6 rounded-2xl shadow-md border bg-white">
        <h2 className="text-2xl font-semibold mb-4">Minutes Listened (Daily / Weekly / Monthly)</h2>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={minutesByDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="minutes" stroke="#4D96FF" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* ---------------- BAR CHART ---------------- */}
      <section className="p-6 rounded-2xl shadow-md border bg-white">
        <h2 className="text-2xl font-semibold mb-4">Top Artists by Minutes Streamed</h2>

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
