/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession } from "next-auth/react";
import { BarChart3, PieChart, Brain, UserCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const { data: session } = useSession();
  const username =
    session?.user?.name ||
    session?.user?.email?.split("@")[0] ||
    "User";

  return (
    <div className="min-h-screen w-full bg-[#1b1b1b] text-white">
      {/* ---------------- TOP NAV ---------------- */}
      <header className="w-full flex items-center justify-between px-10 py-6 bg-[#242424] border-b border-white/10 shadow-lg">
        {/* LEFT: LOGO */}
        <div className="flex items-center gap-3">
          {/* Your logo SVG reused for consistency */}
          <svg width="55" height="35" viewBox="0 0 200 100">
            <defs>
              <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a160ff" />
                <stop offset="100%" stopColor="#ff985c" />
              </linearGradient>
            </defs>

            <circle cx="28" cy="50" r="12" fill="url(#logoGradient)" />
            <rect x="60" y="30" width="10" height="40" fill="url(#logoGradient)" rx="3" />
            <rect x="80" y="20" width="10" height="60" fill="url(#logoGradient)" rx="3" />
            <rect x="100" y="10" width="10" height="80" fill="url(#logoGradient)" rx="3" />
            <rect x="120" y="25" width="10" height="50" fill="url(#logoGradient)" rx="3" />
            <rect x="140" y="35" width="10" height="30" fill="url(#logoGradient)" rx="3" />
          </svg>

          <span className="text-xl font-semibold tracking-wide text-white/95">
            TrackRecord FM
          </span>
        </div>

        {/* RIGHT: Spotify + Profile */}
        <div className="flex items-center gap-6">
          <button className="px-5 py-2.5 rounded-full bg-[#1DB954] hover:bg-[#16a34a] transition-all font-semibold text-white shadow-lg">
            Start Listening on Spotify
          </button>

          <UserCircle2 className="w-10 h-10 text-white/80 hover:text-white transition-all" />
        </div>
      </header>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="px-14 pb-20 pt-14">
        {/* WELCOME HEADER */}
        <h1 className="text-6xl font-bold mb-12">
          <span className="bg-gradient-to-r from-[#a160ff] to-[#ff985c] bg-clip-text text-transparent">
            Welcome Back,
          </span>{" "}
          {username}.
        </h1>

        {/* CARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* --------- QUICK STATS CARD --------- */}
          <Link href="/quick-stats">
            <div className="rounded-3xl p-8 bg-[#6a3ff815] backdrop-blur-md border border-white/10 shadow-xl hover:scale-[1.03] hover:border-white/20 transition-all cursor-pointer">
              <div className="w-full flex justify-center mb-6">
                <BarChart3 size={70} className="text-purple-300" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-center text-white/90">
                QuickStats
              </h2>
              <div className="text-white/70 text-xl space-y-2">
                <p>1. Top Track</p>
                <p>2. Top Artist</p>
                <p>3. Top Genre</p>
              </div>
            </div>
          </Link>

          {/* --------- ANALYTICS CARD --------- */}
          <Link href="/analytics">
            <div className="rounded-3xl p-8 bg-[#ff88d715] backdrop-blur-md border border-white/10 shadow-xl hover:scale-[1.03] hover:border-white/20 transition-all cursor-pointer">
              <div className="w-full flex justify-center mb-6">
                <PieChart size={70} className="text-pink-300" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-center text-white/90">
                View Your Analytics
              </h2>
              <p className="text-white/70 text-center text-lg">
                Dive deeper into your musical patterns, trends, and listening habits.
              </p>
            </div>
          </Link>

          {/* --------- MOOD PROFILE CARD --------- */}
          <Link href="/mood">
            <div className="rounded-3xl p-8 bg-[#ff987515] backdrop-blur-md border border-white/10 shadow-xl hover:scale-[1.03] hover:border-white/20 transition-all cursor-pointer">
              <div className="w-full flex justify-center mb-6">
                <Brain size={70} className="text-orange-300" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-center text-white/90">
                View Your Mood Profile
              </h2>
              <p className="text-white/70 text-center text-lg">
                Understand your musical identity through emotion-based analysis.
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
