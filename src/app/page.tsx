"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, PieChart, Brain } from "lucide-react";
import Logo from "./components/Logo";
import { getQuickStats } from "../utils";

// -------------------- TYPES --------------------
interface QuickStatsItem {
  top_artist: string | null;
  top_track: string | null;
  top_genre: string | null;
}

interface QuickStatsResponse {
  quick_stats: QuickStatsItem[];
}

export default function HomePage() {
  const { data: session } = useSession();

  const [quickStats, setQuickStats] = useState<QuickStatsItem | null>(null);
  const [loadingQuickStats, setLoadingQuickStats] = useState(false);

  // -------------------- LOAD QUICKSTATS --------------------
  useEffect(() => {
    if (!session?.accessToken) return;

    async function loadStats() {
      setLoadingQuickStats(true);

      const stats: QuickStatsResponse = await getQuickStats(
        session.accessToken
      );

      // stats.quick_stats is an array of length 1 from backend
      if (stats?.quick_stats?.length > 0) {
        setQuickStats(stats.quick_stats[0]);
      }

      setLoadingQuickStats(false);
    }

    loadStats();
  }, [session?.accessToken]);

  return (
    <main className="min-h-screen bg-[#1b1b1b] text-white px-10 pb-32">

      {/* ====================== TOP BAR ====================== */}
      <div className="flex items-center justify-between py-6">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <Logo width={55} height={35} />
          <span className="text-xl font-semibold tracking-wide text-white/95">
            TrackRecord FM
          </span>
        </div>

        {/* SPOTIFY BUTTON + PROFILE ICON */}
        <div className="flex items-center gap-4">
          <a
            href="https://open.spotify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1DB954] hover:bg-[#19a64a] transition px-6 py-2 rounded-full font-medium"
          >
            Start Listening on Spotify
          </a>

          <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="1.8" />
              <path
                d="M5 21c0-4 3-7 7-7s7 3 7 7"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ====================== HEADER TEXT ====================== */}
      <h1 className="text-6xl font-bold mt-10 mb-12">
        <span className="bg-gradient-to-r from-[#a160ff] to-[#ff985c] bg-clip-text text-transparent">
          Welcome Back.
        </span>
      </h1>

      {/* ====================== 3 FEATURE CARDS ====================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">

        {/* ----------- QUICK STATS CARD ----------- */}
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

          <h2 className="text-2xl font-semibold">QuickStats</h2>

          <ul className="mt-4 text-white/80 leading-relaxed text-center">
            <li>
              <span className="font-semibold text-white">Top Track:</span>{" "}
              {loadingQuickStats
                ? "Loading..."
                : quickStats?.top_track || "N/A"}
            </li>
            <li>
              <span className="font-semibold text-white">Top Artist:</span>{" "}
              {loadingQuickStats
                ? "Loading..."
                : quickStats?.top_artist || "N/A"}
            </li>
            <li>
              <span className="font-semibold text-white">Top Genre:</span>{" "}
              {loadingQuickStats
                ? "Loading..."
                : quickStats?.top_genre || "N/A"}
            </li>
          </ul>
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

          <h2 className="text-2xl font-semibold text-center">
            View Your Analytics
          </h2>

          <p className="text-white/80 text-center mt-3">
            Dive deeper into your musical patterns, trends, and listening
            habits.
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

          <h2 className="text-2xl font-semibold text-center">
            View Your Mood Profile
          </h2>

          <p className="text-white/80 text-center mt-3">
            Understand your musical identity through emotion-based analysis.
          </p>
        </Link>
      </div>
    </main>
  );
}
