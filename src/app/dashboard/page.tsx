"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "../components/Sidebar";
import Logo from "../components/Logo";

import {
  fetchRecentlyPlayed,
  fetchTopGenres,
  fetchRecommendations,
} from "../../utils";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [topGenres, setTopGenres] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [loading, setLoading] = useState(true);

  // --------------------------
  //   FORMAT DATE LIKE MOOD
  // --------------------------
  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // --------------------------
  //   LOAD DATA SAFELY
  // --------------------------
  useEffect(() => {
    if (status !== "authenticated") return;
    if (!session?.accessToken) return;

    async function load() {
      try {
        setLoading(true);

        const token = session.accessToken;

        const [rp, tg, rc] = await Promise.all([
          fetchRecentlyPlayed(token),
          fetchTopGenres(token),
          fetchRecommendations(token),
        ]);

        setRecentlyPlayed(rp?.recently_played ?? []);
        setTopGenres(tg?.top_genres ?? []);
        setRecommendations(rc?.recommendations ?? []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [status, session]);

  // --------------------------
  //   CARD COMPONENT
  // --------------------------
  const Card = ({ title, subtitle, children }) => (
    <div
      className="
        rounded-3xl p-10
        bg-[#ffffff0a] backdrop-blur-md
        border border-white/10 shadow-xl
        transition-all flex flex-col gap-4
        min-h-[260px]
      "
    >
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="text-white/60 -mt-2">{subtitle}</p>
      <div className="mt-3 text-white/80">{children}</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0d0f18] text-white">

      {/* ---------------- SIDEBAR ---------------- */}
      <div className="w-20 md:w-24 bg-[#0b0d14] border-r border-white/10 flex flex-col items-center py-6 gap-10">
        <Logo className="w-10 h-auto opacity-90" />
        <Sidebar />
      </div>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="flex-1 px-10 py-10">

        {/* HEADER — matches Mood page */}
        <h1 className="text-5xl font-extrabold mb-2">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 text-transparent bg-clip-text">
            Your Analytics
          </span>{" "}
          <span className="text-white">On {formattedDate}:</span>
        </h1>

        {/* GUI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">

          {/* Recently Played */}
          <Card
            title="Recently Played"
            subtitle="A quick peek at what you've been listening to lately."
          >
            {loading ? (
              <p className="text-white/50 animate-pulse">Loading…</p>
            ) : recentlyPlayed.length === 0 ? (
              <p className="text-white/50">No recently played data available yet.</p>
            ) : (
              <ul className="space-y-1">
                {recentlyPlayed.slice(0, 5).map((item, i) => (
                  <li key={i}>{item?.track?.name ?? item?.name ?? "Unknown Track"}</li>
                ))}
              </ul>
            )}
          </Card>

          {/* Genres */}
          <Card
            title="Top Genres"
            subtitle="Genres detected directly from your top artists."
          >
            {loading ? (
              <p className="text-white/50 animate-pulse">Loading…</p>
            ) : topGenres.length === 0 ? (
              <p className="text-white/50">No genre data available.</p>
            ) : (
              <ul className="space-y-1">
                {topGenres.slice(0, 5).map((g, i) => (
                  <li key={i}>{g.genre ?? "Unknown Genre"}</li>
                ))}
              </ul>
            )}
          </Card>

          {/* Recommendations */}
          <Card
            title="Recommendations"
            subtitle="Tracks your backend is suggesting right now."
          >
            {loading ? (
              <p className="text-white/50 animate-pulse">Loading…</p>
            ) : recommendations.length === 0 ? (
              <p className="text-white/50">No recommendations available yet.</p>
            ) : (
              <ul className="space-y-1">
                {recommendations.slice(0, 5).map((track, i) => (
                  <li key={i}>{track?.name ?? "Unknown Track"}</li>
                ))}
              </ul>
            )}
          </Card>

        </div>
      </main>
    </div>
  );
}
