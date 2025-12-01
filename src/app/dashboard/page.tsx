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

/* ------------------------------------------------------------------------------------
   TYPES
------------------------------------------------------------------------------------ */
interface RecentlyPlayedItem {
  played_at?: string;
  ["track.duration_ms"]?: number;
  ["track.name"]?: string;
  ["track.artists"]?: { name: string }[];
  ["track.genres"]?: string[];
  [key: string]: any;
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
  count: number;
  percentage: number;
}

/* ------------------------------------------------------------------------------------
   THEME COLORS (BLACK DIAMOND)
------------------------------------------------------------------------------------ */
const BD_COLORS = [
  "#A78BFA",
  "#C084FC",
  "#E879F9",
  "#FB7185",
  "#38BDF8",
  "#7DD3FC",
  "#FDE68A",
];

const HEATMAP_COLORS = [
  "#0f1424",
  "#1e2850",
  "#28346b",
  "#36459c",
  "#4d63d4",
  "#6b7fff",
];

/* ------------------------------------------------------------------------------------
   SIMPLE CARD WRAPPER
------------------------------------------------------------------------------------ */
function SimpleCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl p-8 bg-[#11121c] border border-white/10 shadow-xl backdrop-blur-xl">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="text-white/50 -mt-1 mb-3">{subtitle}</p>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------------------------
   GENRE DETAIL EXPANSION
------------------------------------------------------------------------------------ */
function GenreDetailSection({
  genre,
  recentlyPlayed,
}: {
  genre: string;
  recentlyPlayed: RecentlyPlayedItem[];
}) {
  if (!genre || genre === "Other") return null;

  const artistCount: Record<string, number> = {};

  recentlyPlayed.forEach((item) => {
    const genres = item["track.genres"] ?? [];
    if (!Array.isArray(genres)) return;

    if (genres.some((g) => g.toLowerCase().includes(genre.toLowerCase()))) {
      const artists = item["track.artists"] ?? [];
      artists.forEach((a: any) => {
        const name = a.name ?? "Unknown Artist";
        artistCount[name] = (artistCount[name] || 0) + 1;
      });
    }
  });

  const topArtists = Object.entries(artistCount)
    .map(([artist, count]) => ({ artist, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div className="mt-4 p-4 rounded-2xl bg-[#151622] border border-white/10 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-2">
        Top Artists in {genre}
      </h3>

      {topArtists.length === 0 ? (
        <p className="text-white/50">No artists found for this genre.</p>
      ) : (
        <ul className="space-y-1">
          {topArtists.map((a, idx) => (
            <li
              key={idx}
              className="text-white/70 flex justify-between border-b border-white/5 pb-1"
            >
              <span>{a.artist}</span>
              <span className="text-white/40">{a.count} tracks</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------------------
   HEATMAP (24 HOURS)
------------------------------------------------------------------------------------ */
function HeatmapRenderer({ data }: { data: number[] }) {
  const maxVal = Math.max(...data);

  return (
    <div>
      <div className="grid grid-cols-12 gap-1">
        {data.slice(0, 12).map((val, hour) => {
          const intensity = maxVal === 0 ? 0 : val / maxVal;
          const idx = Math.min(5, Math.floor(intensity * 5));

          return (
            <div
              key={hour}
              title={`${hour}:00 — ${val} minutes`}
              className="h-8 rounded-md transition-all duration-150"
              style={{
                backgroundColor: HEATMAP_COLORS[idx],
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            ></div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-1 mt-1">
        {data.slice(12).map((val, idx) => {
          const hour = idx + 12;
          const intensity = maxVal === 0 ? 0 : val / maxVal;
          const i = Math.min(5, Math.floor(intensity * 5));

          return (
            <div
              key={hour}
              title={`${hour}:00 — ${val} minutes`}
              className="h-8 rounded-md transition-all duration-150"
              style={{
                backgroundColor: HEATMAP_COLORS[i],
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            ></div>
          );
        })}
      </div>

      {/* Hours axis */}
      <div className="mt-2 flex justify-between text-white/50 text-xs">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i}>{i}</span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------
   TOP ARTISTS BAR (HORIZONTAL)
------------------------------------------------------------------------------------ */
function TopArtistsBar({
  data,
  showAll,
  setShowAll,
}: {
  data: BarDataPoint[];
  showAll: boolean;
  setShowAll: (v: boolean) => void;
}) {
  const shown = showAll ? data.slice(0, 10) : data.slice(0, 5);

  return (
    <div className="bg-[#11121c] p-6 rounded-3xl shadow-xl border border-white/10 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Top Artists</h2>
        <button
          onClick={() => setShowAll(!showAll)}
          className="px-3 py-1 rounded-full bg-[#1f2338] border border-white/10 text-white/70 text-sm"
        >
          {showAll ? "Show Top 5" : "Show Top 10"}
        </button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={shown} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          <XAxis type="number" stroke="#ffffff90" />
          <YAxis
            dataKey="artist"
            type="category"
            width={120}
            stroke="#ffffff90"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1b1c29",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="count" fill="url(#artistGradient)" radius={[6, 6, 6, 6]} />

          <defs>
            <linearGradient id="artistGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#E879F9" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------------------------
   DONUT CHART (GENRES)
------------------------------------------------------------------------------------ */
function DonutChart({
  pieData,
  expandedGenre,
  setExpandedGenre,
  recentlyPlayed,
}: {
  pieData: PieDataPoint[];
  expandedGenre: string | null;
  setExpandedGenre: (v: string | null) => void;
  recentlyPlayed: RecentlyPlayedItem[];
}) {
  return (
    <div className="bg-[#11121c] p-6 rounded-3xl shadow-xl border border-white/10 text-white col-span-1 md:col-span-2">
      <h2 className="text-2xl font-bold mb-4">Genre Breakdown</h2>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Tooltip
            formatter={(v: any, name: any) => [`${v} tracks`, name]}
            contentStyle={{
              backgroundColor: "#1b1c29",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
              borderRadius: "8px",
            }}
          />
          <Legend wrapperStyle={{ color: "white" }} />

          <Pie
            data={pieData}
            dataKey="count"
            nameKey="genre"
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={60}
            onClick={(entry) =>
              setExpandedGenre(
                expandedGenre === entry.genre ? null : entry.genre
              )
            }
          >
            {pieData.map((entry, i) => (
              <Cell
                key={i}
                fill={BD_COLORS[i % BD_COLORS.length]}
                stroke="#0d0f18"
                strokeWidth={2}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {expandedGenre && (
        <GenreDetailSection
          genre={expandedGenre}
          recentlyPlayed={recentlyPlayed}
        />
      )}
    </div>
  );
}

/* ====================================================================================
   MAIN DASHBOARD COMPONENT
===================================================================================== */
export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>([]);
  const [topGenres, setTopGenres] = useState<GenreItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [lineData, setLineData] = useState<LineDataPoint[]>([]);
  const [artistBarData, setArtistBarData] = useState<BarDataPoint[]>([]);
  const [pieData, setPieData] = useState<PieDataPoint[]>([]);
  const [heatmapData, setHeatmapData] = useState<number[]>(new Array(24).fill(0));

  const [expandedGenre, setExpandedGenre] = useState<string | null>(null);
  const [showAllArtists, setShowAllArtists] = useState(false);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  /* ------------------------------------------------------------------------------------
     FETCH DATA
  ------------------------------------------------------------------------------------ */
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

        const recently = rp?.recently_played ?? [];
        const genres = tg?.top_genres ?? [];
        const recs = rc?.recommendations ?? [];

        setRecentlyPlayed(recently);
        setTopGenres(genres);
        setRecommendations(recs);

        /* --- Line chart --- */
        const dailyTotals: Record<string, number> = {};
        recently.forEach((item) => {
          const date = item.played_at?.slice(0, 10);
          const ms = item["track.duration_ms"] ?? 0;
          if (!date) return;
          dailyTotals[date] = (dailyTotals[date] || 0) + ms;
        });

        const mappedLine = Object.entries(dailyTotals)
          .map(([date, ms]) => ({ date, minutes: Math.round(ms / 60000) }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setLineData(mappedLine);

        /* --- Artists bar chart --- */
        const artistCounts: Record<string, number> = {};
        recently.forEach((item) => {
          const artists = item["track.artists"] ?? [];
          artists.forEach((a) => {
            const name = a.name ?? "Unknown Artist";
            artistCounts[name] = (artistCounts[name] || 0) + 1;
          });
        });

        const artistList = Object.entries(artistCounts)
          .map(([artist, count]) => ({ artist, count }))
          .sort((a, b) => b.count - a.count);

        setArtistBarData(artistList);

        /* --- Pie / Donut chart --- */
        const genreCounts: Record<string, number> = {};
        genres.forEach((g) => {
          const name = g.genre ?? "Unknown";
          genreCounts[name] = (genreCounts[name] || 0) + 1;
        });

        const sorted = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
        const total = sorted.reduce((a, [, v]) => a + v, 0);

        const top5 = sorted.slice(0, 5);
        const others = sorted.slice(5).reduce((acc, [, v]) => acc + v, 0);

        const finalPie: PieDataPoint[] = [
          ...top5.map(([genre, count]) => ({
            genre,
            count,
            percentage: Number(((count / total) * 100).toFixed(1)),
          })),
          {
            genre: "Other",
            count: others,
            percentage: Number(((others / total) * 100).toFixed(1)),
          },
        ];

        setPieData(finalPie);

        /* --- Heatmap --- */
        const hourBins = new Array(24).fill(0);
        recently.forEach((item) => {
          const timestamp = item.played_at;
          const ms = item["track.duration_ms"] ?? 0;
          if (!timestamp) return;
          const hour = new Date(timestamp).getHours();
          hourBins[hour] += Math.round(ms / 60000);
        });

        setHeatmapData(hourBins);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [status, session]);

  /* ====================================================================================
     RENDER
  ==================================================================================== */
  return (
    <div className="flex min-h-screen bg-[#0d0f18] text-white">
      {/* SIDEBAR */}
      <div className="w-20 md:w-24 bg-[#0b0d14] border-r border-white/10 flex flex-col items-center py-6 gap-10 shadow-lg shadow-black/30">
        <Logo className="w-10 h-auto opacity-90" />
        <Sidebar />
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-10 py-10">
        <h1 className="text-5xl font-extrabold tracking-tight mb-2">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 text-transparent bg-clip-text">
            Your Analytics
          </span>{" "}
          on {formattedDate}
        </h1>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">
          <SimpleCard title="Recently Played" subtitle="Your latest listening history">
            {loading ? (
              <p>Loading…</p>
            ) : (
              <ul className="space-y-1 text-white/80">
                {recentlyPlayed.slice(0, 5).map((item, i) => (
                  <li key={i}>{item["track.name"] ?? "Unknown Track"}</li>
                ))}
              </ul>
            )}
          </SimpleCard>

          <SimpleCard title="Top Genres" subtitle="Detected from your listening data">
            <ul className="space-y-1 text-white/80">
              {topGenres.slice(0, 5).map((g, i) => (
                <li key={i}>{g.genre ?? "Unknown"}</li>
              ))}
            </ul>
          </SimpleCard>

          <SimpleCard title="Recommendations" subtitle="Tracks curated for you">
            <ul className="space-y-1 text-white/80">
              {recommendations.slice(0, 5).map((rec, i) => (
                <li key={i}>{rec.name ?? "Unknown"}</li>
              ))}
            </ul>
          </SimpleCard>
        </div>

        {/* CHART SECTION */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* LINE CHART */}
          <div className="bg-[#11121c] p-6 rounded-3xl shadow-xl border border-white/10">
            <h2 className="text-2xl font-bold mb-4">Daily Listening Trend</h2>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="date" stroke="#ffffff90" />
                  <YAxis
                    stroke="#ffffff90"
                    label={{
                      value: "Minutes",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#ffffff90",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1b1c29",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "white" }} />
                  <Line
                    type="monotone"
                    dataKey="minutes"
                    stroke="#A78BFA"
                    strokeWidth={3}
                    dot={{ r: 5, stroke: "#fff", strokeWidth: 1 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No listening data available</p>
            )}
          </div>

          {/* TOP ARTISTS BAR */}
          <TopArtistsBar
            data={artistBarData}
            showAll={showAllArtists}
            setShowAll={setShowAllArtists}
          />

          {/* GENRE DONUT */}
          <DonutChart
            pieData={pieData}
            expandedGenre={expandedGenre}
            setExpandedGenre={setExpandedGenre}
            recentlyPlayed={recentlyPlayed}
          />

          {/* HEATMAP */}
          <div className="bg-[#11121c] p-6 rounded-3xl shadow-xl border border-white/10 col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Listening Activity by Hour</h2>
            <HeatmapRenderer data={heatmapData} />
          </div>
        </div>
      </main>
    </div>
  );
}


