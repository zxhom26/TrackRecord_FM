"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import Logo from "./components/Logo";
import { BarChart3, PieChart, Brain } from "lucide-react";
import Link from "next/link";
import { getQuickStats } from "../utils";

export default function HomePage() {
  const { data: session } = useSession();

  const [quickStats, setQuickStats] = useState<any>(null);
  const [loadingQuickStats, setLoadingQuickStats] = useState(false);

  // Load QuickStats on page load
  useEffect(() => {
    if (!session?.accessToken) return;

    async function loadStats() {
      setLoadingQuickStats(true);
      const stats = await getQuickStats(session.accessToken);
      setQuickStats(stats?.quick_stats?.[0] || null);
      setLoadingQuickStats(false);
    }

    loadStats();
  }, [session?.accessToken]);

  return (
    <main className="min-h-screen bg-[#1b1b1b] text-white px-10 pb-32">

      {/* ====================== TOP BAR ====================== */}
      <div className="flex items-center justify-between py-6">
        {/* LOGO */}
        <Logo />

        {/* SPOTIFY BUTTON */}
        <a
          href="https://open.spotify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#1DB954] hover:bg-[#19a64a] transition px-6 py-2 rounded-full font-medium"
        >
          Start Listening on Spotify
        </a>
      </div>

      {/* ====================== HEADER TEXT ====================== */}
      <h1 className="text-6xl font-bold mt-10 mb-12">
        <span className="bg-gradient-to-r from-[#a160ff] to-[#ff985c] bg-clip-text text-transparent">
          Welcome Back.
        </span>
      </h1>

      {/* ====================== 3 FEATURE CARDS ====================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">

        {/* ----------- QUICK STATS CARD (NO REDIRECT) ----------- */}
        <div
          className="
            rounded-3xl p-10
            bg-[#6a3ff815] backdrop-blur-md
            border border-white/10 shadow-xl
            hover:scale-[1.03] hover:border-white/20
            transition-all cursor-default

            flex flex-col justify-between items-center
            min-h-[260px]
          "
        >
          <BarChart3 size={42} className="text-purple-400 mb-4" />

          <h2 className="text-2xl font-semibold mb-4 text-center">QuickStats</h2>

          {loadingQuickStats ? (
            <p className="text-white/70">Loading...</p>
          ) : quickStats ? (
            <ul className="mt-2 text-white/80 leading-relaxed text-center">
              <li>🎵 <b>Top Track:</b> {quickStats.top_track || "N/A"}</li>
              <li>🧑‍🎤 <b>Top Artist:</b> {quickStats.top_artist || "N/A"}</li>
              <li>🎶 <b>Top Genre:</b> {quickStats.top_genre || "N/A"}</li>
            </ul>
          ) : (
            <p className="text-white/70">No data available.</p>
          )}
        </div>

        {/* ----------- ANALYTICS (REDIRECT) ----------- */}
        <Link
          href="/analytics"
          className="
            rounded-3xl p-10
            bg-[#ff88d715] backdrop-blur-md
            border border-white/10 shadow-xl
            hover:scale-[1.03] hover:border-white/20
            transition-all

            flex flex-col justify-between items-center
            min-h-[260px]
          "
        >
          <PieChart size={42} className="text-pink-300 mb-4" />
          <h2 className="text-2xl font-semibold text-center">View Your Analytics</h2>
          <p className="text-white/80 text-center mt-3">
            Dive deeper into your musical patterns and listening habits.
          </p>
        </Link>

        {/* ----------- MOOD PROFILE (REDIRECT) ----------- */}
        <Link
          href="/mood"
          className="
            rounded-3xl p-10
            bg-[#ff987515] backdrop-blur-md
            border border-white/10 shadow-xl
            hover:scale-[1.03] hover:border-white/20
            transition-all

            flex flex-col justify-between items-center
            min-h-[260px]
          "
        >
          <Brain size={42} className="text-orange-300 mb-4" />
          <h2 className="text-2xl font-semibold text-center">View Your Mood Profile</h2>
          <p className="text-white/80 text-center mt-3">
            Understand your musical identity through emotion-based analysis.
          </p>
        </Link>

      </div>
    </main>
  );
}
