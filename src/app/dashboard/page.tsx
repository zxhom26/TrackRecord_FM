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

// ---------------- TYPES ----------------
interface RecentlyPlayedItem {
  played_at?: string;
  track?: {
    duration_ms?: number;
  };
  [key: string]: unknown;
}

interface GenreItem {
  genre?: string | null;
  [key: string]: unknown;
}

interface RecommendationItem {
  name?: string;
  [key: string]: unknown;
}

// RECHARTS TYPE REQUIREMENT
interface LineDataPoint {
  date: string;
  minutes: number;
  [key: string]: string | number;
}

interface BarDataPoint {
  artist: string;
  minutes: number;
  [key: string]: string | number;
}

interface PieDataPoint {
  genre: string;
  minutes: number;

  // ✔ REQUIRED for Recharts strict TS mode
  [key: string]: string | number;
}

interface CardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

// ---------------- CARD ----------------
function SimpleCard(props: CardProps) {
  return (
    <div className="rounded-3xl p-10 bg-[#ffffff0a] backdrop-blur-md border border-white/10 shadow-xl">
      <h2 className="text-2xl font-semibold text-white">{props.title}</h2>
      <p className="text-white/60 -mt-2">{props.subtitle}</p>
      <div className="mt-3 text-white/80">{props.children}</div>
    </div>
  );
}

// ---------------- DASHBOARD ----------------
export default function DashboardPage() {
  const { data: session, status } = useSession();

  // Raw data
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>([]);
  const [topGenres, setTopGenres] = useState<GenreItem[]>([]);
  const [recommendations, setRecommendations] =
    useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Chart data
  const [lineData, setLineData] = useState<LineDataPoint[]>([]);
  const [barData, setBarData] = useState<BarDataPoint[]>([]);
  const [pieData, setPieData] = useState<PieDataPoint[]>([]);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // ---------------- LOAD DATA USING DISHA'S UTILS ----------------
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

        const recently = (rp?.recently_played as RecentlyPlayedItem[]) ?? [];
        const genres = (tg?.top_genres as GenreItem[]) ?? [];
        const recs = (rc?.recommendations as RecommendationItem[]) ?? [];

        setRecentlyPlayed(recently);
        setTopGenres(genres);
        setRecommendations(recs);

        // ---------------- MAP TO CHARTS ----------------

        // LINE: from recently played
        const lineMapped: LineDataPoint[] = recently.map((item) => ({
          date: item.played_at?.slice(0, 10) ?? "Unknown",
          minutes: item.track?.duration_ms
            ? Math.floor(item.track.duration_ms / 60000)
            : 0,
        }));
        setLineData(lineMapped);

        // PIE: Genre counts
        const genreCountMap: Record<string, number> = {};
        genres.forEach((g) => {
          const genre = g.genre ?? "Unknown";
          genreCountMap[genre] = (genreCountMap[genre] || 0) + 1;
        });

        const pieMapped: PieDataPoint[] = Object.entries(genreCountMap).map(
          ([genre, minutes]) => ({
            genre,
            minutes,
          })
        );
        setPieData(pieMapped);

        // BAR: Mock minutes per recommendation track
        const barMapped: BarDataPoint[] = recs.map((track) => ({
          artist: track.name ?? "Unknown",
          minutes: Math.floor(Math.random() * 40) + 10,
        }));
        setBarData(barMapped);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [status, session]);

  const PIE_COLORS = [
    "#FF6B6B",
    "#FFD93D",
    "#6BCB77",
    "#4D96FF",
    "#B76CFD",
    "#FF914D",
  ];

  // ---------------- UI ----------------
  return (
    <div className="flex min-h-screen bg-[#0d0f18] text-white">
      {/* Sidebar */}
      <div className="w-20 md:w-24 bg-[#0b0d14] border-r border-white/10 flex flex-col items-center py-6 gap-10">
        <Logo className="w-10 h-auto opacity-90" />
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 px-10 py-10">
        <h1 className="text-5xl font-extrabold mb-2">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 text-transparent bg-clip-text">
            Your Analytics
          </span>{" "}
          On {formattedDate}
        </h1>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">
          <SimpleCard title="Recently Played" subtitle="Last tracks">
            {loading ? <p>Loading…</p> : <pre>{JSON.stringify(recentlyPlayed.slice(0, 5), null, 2)}</pre>}
          </SimpleCard>

          <SimpleCard title="Top Genres" subtitle="From your top artists">
            <ul>
              {topGenres.slice(0, 5).map((g, i) => (
                <li key={i}>{g.genre ?? "Unknown"}</li>
              ))}
            </ul>
          </SimpleCard>

          <SimpleCard title="Recommendations" subtitle="Suggested for you">
            <ul>
              {recommendations.slice(0, 5).map((rec, i) => (
                <li key={i}>{rec.name ?? "Unknown"}</li>
              ))}
            </ul>
          </SimpleCard>
        </div>

        {/* ---------------- CHARTS ---------------- */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* LINE */}
          <div className="bg-white p-6 rounded-3xl shadow-xl text-black">
            <h2 className="text-2xl font-bold mb-4">Minutes Listened</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="#4D96FF"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* BAR */}
          <div className="bg-white p-6 rounded-3xl shadow-xl text-black">
            <h2 className="text-2xl font-bold mb-4">Recommended Tracks</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="artist" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="minutes" fill="#6BCB77" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PIE */}
          <div className="bg-white p-6 rounded-3xl shadow-xl text-black col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Genre Breakdown</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={pieData}
                  dataKey="minutes"
                  nameKey="genre"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}

