"use client";

import { useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "../components/Sidebar";
import Logo from "../components/Logo";

import {
  fetchRecentlyPlayed,
  fetchTopGenres,
  fetchRecommendations,
} from "../../utils";

// -----------------------
// TYPES
// -----------------------
interface RecentlyPlayedItem {
  track?: { name?: string };
  name?: string;
}

interface GenreItem {
  genre?: string | null;
}

interface RecommendationItem {
  name?: string;
}

interface CardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

// -----------------------
// CARD COMPONENT (SAFE)
// -----------------------
function SimpleCard(props: CardProps) {
  return (
    <div
      className="
        rounded-3xl p-10
        bg-[#ffffff0a] backdrop-blur-md
        border border-white/10 shadow-xl
        min-h-[260px]
      "
    >
      <h2 className="text-2xl font-semibold text-white">{props.title}</h2>
      <p className="text-white/60 -mt-2">{props.subtitle}</p>
      <div className="mt-3 text-white/80">{props.children}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();

  // -----------------------
  // STATE (STRICT TYPED)
  // -----------------------
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>([]);
  const [topGenres, setTopGenres] = useState<GenreItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // -----------------------
  // DATE FORMAT
  // -----------------------
  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // -----------------------
  // DATA LOADING (TS-SAFE)
  // -----------------------
  useEffect(() => {
    if (status !== "authenticated") return;

    const token = session?.accessToken;
    if (!token) return;

    async function load() {
      setLoading(true);
      try {
        const [rp, tg, rc] = await Promise.all([
          fetchRecentlyPlayed(token),
          fetchTopGenres(token),
          fetchRecommendations(token),
        ]);

        setRecentlyPlayed((rp?.recently_played as RecentlyPlayedItem[]) ?? []);
        setTopGenres((tg?.top_genres as GenreItem[]) ?? []);
        setRecommendations((rc?.recommendations as RecommendationItem[]) ?? []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [status, session]);

  // -----------------------
  // UI
  // -----------------------
  return (
    <div className="flex min-h-screen bg-[#0d0f18] text-white">

      {/* Sidebar */}
      <div className="w-20 md:w-24 bg-[#0b0d14] border-r border-white/10 flex flex-col items-center py-6 gap-10">
        <Logo className="w-10 h-auto opacity-90" />
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 px-10 py-10">

        <h1 className="text-5xl font-extrabold mb-2">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 text-transparent bg-clip-text">
            Your Analytics
          </span>{" "}
          <span className="text-white">On {formattedDate}:</span>
        </h1>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">

          {/* Recently Played */}
          <SimpleCard
            title="Recently Played"
            subtitle="A quick peek at what you’ve been listening to."
          >
            {loading ? (
              <p className="text-white/50">Loading…</p>
            ) : recentlyPlayed.length === 0 ? (
              <p className="text-white/50">No recently played data available.</p>
            ) : (
              <ul className="space-y-1">
                {recentlyPlayed.slice(0, 5).map((item, index) => (
                  <li key={index}>
                    {item.track?.name ??
                      item.name ??
                      "Unknown Track"}
                  </li>
                ))}
              </ul>
            )}
          </SimpleCard>

          {/* Top Genres */}
          <SimpleCard
            title="Top Genres"
            subtitle="Genres detected from your top artists."
          >
            {loading ? (
              <p className="text-white/50">Loading…</p>
            ) : topGenres.length === 0 ? (
              <p className="text-white/50">No genre data available.</p>
            ) : (
              <ul className="space-y-1">
                {topGenres.slice(0, 5).map((g, index) => (
                  <li key={index}>{g.genre ?? "Unknown Genre"}</li>
                ))}
              </ul>
            )}
          </SimpleCard>

          {/* Recommendations */}
          <SimpleCard
            title="Recommendations"
            subtitle="Tracks suggested just for you."
          >
            {loading ? (
              <p className="text-white/50">Loading…</p>
            ) : recommendations.length === 0 ? (
              <p className="text-white/50">No recommendations available.</p>
            ) : (
              <ul className="space-y-1">
                {recommendations.slice(0, 5).map((track, index) => (
                  <li key={index}>{track.name ?? "Unknown Track"}</li>
                ))}
              </ul>
            )}
          </SimpleCard>

        </div>
      </main>
    </div>
  );
}
