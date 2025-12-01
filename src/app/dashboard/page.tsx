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
  ["track.duration_ms"]?: number;
  ["track.name"]?: string;
  ["track.artists"]?: { name: string }[];
  [key: string]: unknown;
}

interface GenreItem {
  genre?: string | null;
}

interface RecommendationItem {
  name?: string;
}

interface LineDataPoint {
  date: string;
  minutes: number;
}

interface BarDataPoint {
  artist: string;
  count: number;
}

interface PieDataPoint {
  genre: string;
  minutes: number;
  [key: string]: string | number;
}

interface HeatmapCell {
  hour: number;
  count: number;
}

// ---------------- CARD COMPONENT ----------------
function SimpleCard(props: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl p-10 bg-[#ffffff0a] backdrop-blur-md border border-white/10 shadow-xl">
      <h2 className="text-2xl font-semibold text-white">{props.title}</h2>
      <p className="text-white/60 -mt-2">{props.subtitle}</p>
      <div className="mt-3 text-white/80">{props.children}</div>
    </div>
  );
}

// ---------------- MAIN ----------------
export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>([]);
  const [topGenres, setTopGenres] = useState<GenreItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [lineData, setLineData] = useState<LineDataPoint[]>([]);
  const [barData, setBarData] = useState<BarDataPoint[]>([]);
  const [pieData, setPieData] = useState<PieDataPoint[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // ---------------- FETCH DATA ----------------
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

        // ---------------- LINE CHART (REAL MINUTES/DAY) ----------------
        const dailyMap: Record<string, number> = {};

        recently.forEach((item) => {
          const played = item["played_at"]?.slice(0, 10);
          const ms = item["track.duration_ms"] ?? 0;
          if (!played) return;
          dailyMap[played] = (dailyMap[played] || 0) + ms;
        });

        const mappedLine = Object.entries(dailyMap)
          .map(([date, totalMs]) => ({
            date,
            minutes: Math.round(totalMs / 60000),
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setLineData(mappedLine);

        // ---------------- PIE CHART (TOP 5 + OTHER) ----------------
        const counts: Record<string, number> = {};
        genres.forEach((g) => {
          const name = g.genre ?? "Unknown";
          counts[name] = (counts[name] || 0) + 1;
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const top5 = sorted.slice(0, 5);
        const other = sorted.slice(5).reduce((sum, [, v]) => sum + v, 0);

        const total = sorted.reduce((sum, [, v]) => sum + v, 0);

        const mappedPie = [
          ...top5.map(([genre, count]) => ({
            genre,
            minutes: count,
            percent: ((count / total) * 100).toFixed(1),
          })),
          {
            genre: "Other",
            minutes: other,
            percent: ((other / total) * 100).toFixed(1),
          },
        ];

        setPieData(mappedPie);

        // ---------------- ARTIST BAR CHART (REAL FREQUENCY) ----------------
        const artistFreq: Record<string, number> = {};

        recently.forEach((item) => {
          const artists = item["track.artists"] ?? [];
          artists.forEach((a: { name: string }) => {
            artistFreq[a.name] = (artistFreq[a.name] || 0) + 1;
          });
        });

        const sortedArtists = Object.entries(artistFreq)
          .map(([artist, count]) => ({ artist, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setBarData(sortedArtists);

        // ---------------- HEATMAP (HOUR OF DAY) ----------------
        const hourMap: Record<number, number> = {};

        recently.forEach((item) => {
          if (!item.played_at) return;
          const hour = new Date(item.played_at).getHours();
          hourMap[hour] = (hourMap[hour] || 0) + 1;
        });

        const mappedHeat = Array.from({ length: 24 }, (_, hour) => ({
          hour,
          count: hourMap[hour] ?? 0,
        }));

        setHeatmap(mappedHeat);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [status, session]);

  // COLORS
  const PIE_COLORS = [
    "#A78BFA", "#C084FC", "#E879F9", "#FB7185", "#FCA5A5", "#94A3B8",
  ];

  const HEAT_COLORS = ["#1e293b", "#475569", "#64748b", "#94a3b8", "#cbd5e1"];

  // ---------------- UI ----------------
  return (
    <div className="flex min-h-screen bg-[#0d0f18] text-white">
      <div className="w-20 md:w-24 bg-[#0b0d14] border-r border-white/10 flex flex-col items-center py-6 gap-10">
        <Logo className="w-10 h-auto opacity-90" />
        <Sidebar />
      </div>

      <main className="flex-1 px-10 py-10">
        <h1 className="text-5xl font-extrabold mb-2">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 text-transparent bg-clip-text">
            Your Analytics
          </span>{" "}
          On {formattedDate}
        </h1>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">
          <SimpleCard title="Recently Played" subtitle="Last tracks">
            {loading ? <p>Loading…</p> : (
              <ul>
                {recentlyPlayed.slice(0, 5).map((item, i) => (
                  <li key={i}>{item["track.name"] ?? "Unknown Track"}</li>
                ))}
              </ul>
            )}
          </SimpleCard>

          <SimpleCard title="Top Genres" subtitle="From your listening data">
            <ul>
              {topGenres.slice(0, 5).map((g, i) => (
                <li key={i}>{g.genre ?? "Unknown"}</li>
              ))}
            </ul>
          </SimpleCard>

          <SimpleCard title="Recommendations" subtitle="Tracks suggested for you">
            <ul>
              {recommendations.slice(0, 5).map((rec, i) => (
                <li key={i}>{rec.name ?? "Unknown"}</li>
              ))}
            </ul>
          </SimpleCard>
        </div>

        {/* CHARTS */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* LINE CHART */}
          <div className="bg-white p-6 rounded-3xl shadow-xl text-black">
            <h2 className="text-2xl font-bold mb-4">Minutes Listened Per Day</h2>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <defs>
                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4D96FF" stopOpacity={0.7}/>
                      <stop offset="100%" stopColor="#4D96FF" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="minutes"
                    stroke="#4D96FF"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                    fillOpacity={1}
                    fill="url(#colorMinutes)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No listening data available</p>
            )}
          </div>

          {/* ARTIST BAR CHART */}
          <div className="bg-white p-6 rounded-3xl shadow-xl text-black">
            <h2 className="text-2xl font-bold mb-4">Top Artists (Your Last 50 Tracks)</h2>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="artist" type="category" width={120}/>
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#A78BFA" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No artist data available</p>
            )}
          </div>

          {/* GENRE DONUT */}
          <div className="bg-white p-6 rounded-3xl shadow-xl text-black col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Genre Breakdown</h2>

            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Tooltip formatter={(v, n, d) => [`${d.payload.percent}%`, n]} />
                  <Legend />
                  <Pie
                    data={pieData}
                    dataKey="minutes"
                    nameKey="genre"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p>No genre data available</p>
            )}
          </div>

          {/* HEATMAP */}
          <div className="bg-white p-6 rounded-3xl shadow-xl text-black col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Listening Activity by Hour</h2>

            <div className="grid grid-cols-12 gap-1">
              {heatmap.map((h, i) => (
                <div
                  key={i}
                  title={`${h.hour}:00 — ${h.count} plays`}
                  className="h-6 rounded-md transition hover:scale-110"
                  style={{
                    backgroundColor:
                      HEAT_COLORS[
                        h.count === 0
                          ? 0
                          : h.count === 1
                          ? 1
                          : h.count === 2
                          ? 2
                          : h.count < 5
                          ? 3
                          : 4
                      ],
                  }}
                ></div>
              ))}
            </div>

            <div className="flex justify-between text-xs text-gray-600 mt-2">
              {Array.from({ length: 24 }, (_, i) => (
                <span key={i}>{i}</span>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
