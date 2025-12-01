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

/* ----------------------------------------
   TYPES — STRICT (NO `any`)
-----------------------------------------*/

// Spotify artist object
interface SpotifyArtist {
  name: string;
}

// Shape of a recently played track returned by backend

interface RecentlyPlayedItem {
  played_at?: string;
  "track.duration_ms"?: number;
  "track.name"?: string;
  "track.artists"?: SpotifyArtist[];
  "track.genres"?: string[];
  [key: string]: unknown;
}

// Genre object from backend
interface GenreItem {
  genre: string | null;
}

// Genre object from backend
interface RecommendationItem {
  name: string;
}

// Data structure for the line chart (daily minutes)
interface LineDataPoint {
  date: string;
  minutes: number;
}

// Data structure for the top artists bar chart
interface BarDataPoint {
  artist: string;
  count: number;
}

// Pie chart structure
interface PieDataPoint {
  genre: string;
  count: number;
  percentage: number;
  [key: string]: string | number;
}


/* ----------------------------------------
   THEME COLORS — BLACK DIAMOND
-----------------------------------------*/
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

/* ----------------------------------------
   SIMPLE CARD WRAPPER
-----------------------------------------*/
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
/* ----------------------------------------
   GENRE DETAIL SECTION
-----------------------------------------*/
function GenreDetailSection({
  genre,
  recentlyPlayed,
}: {
  genre: string;
  recentlyPlayed: RecentlyPlayedItem[];
}) {
    // Don't show anything if clicking "Other" or empty
  if (!genre || genre === "Other") return null;

   // Count artists for the selected genre
  const artistCount: Record<string, number> = {};

 recentlyPlayed.forEach((item: RecentlyPlayedItem) => {
  const genres = item["track.genres"];
  if (!Array.isArray(genres)) return;

  // Does the track match the clicked donut slice?
  const match = genres.some((g) =>
    g.toLowerCase().includes(genre.toLowerCase())
  );

  if (match) {
    const artists = item["track.artists"] ?? [];
    artists.forEach((a) => {
      const name = a.name;
      artistCount[name] = (artistCount[name] || 0) + 1;
    });
  }
});

  // Convert dictionary → sorted list
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
        <p className="text-white/50">No artists found.</p>
      ) : (
        <ul className="space-y-1">
          {topArtists.map((a, i) => (
            <li
              key={i}
              className="flex justify-between text-white/80 border-b border-white/10 pb-1"
            >
              <span>{a.artist}</span>
              <span className="text-white/50">{a.count} tracks</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ----------------------------------------
   HEATMAP (24 hours)
-----------------------------------------*/
function HeatmapRenderer({ data }: { data: number[] }) {
  const maxVal = Math.max(...data);

  const COLORS = [
    "#1f2335", // none
    "#3f4bce", // low
    "#6573ff",
    "#7a83ff",
    "#8f99ff",
    "#a8b1ff", // highest
  ];

  return (
    <div className="w-full flex flex-col items-center">

      {/* SINGLE ROW OF 24 BLOCKS */}
      <div className="
        grid 
        grid-cols-24 
        gap-2 
        w-full 
        max-w-[1200px] 
        mx-auto 
        place-items-center
      ">
        {data.map((val, hour) => {
          const intensity = maxVal === 0 ? 0 : val / maxVal;
          const idx = Math.min(5, Math.floor(intensity * 5));

          return (
            <div key={hour} className="flex flex-col items-center">
              <div
                className="
                  w-8 h-8 
                  sm:w-9 sm:h-9 
                  md:w-10 md:h-10 
                  rounded-lg 
                  transition-all duration-150
                "
                style={{
                  backgroundColor: COLORS[idx],
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                title={`${hour}:00 — ${val} minutes`}
              ></div>
            </div>
          );
        })}
      </div>

      {/* LABELS UNDERNEATH */}
      <div
        className="
          grid 
          grid-cols-24 
          gap-2 
          w-full 
          max-w-[1200px] 
          mx-auto 
          mt-3
        "
      >
        {Array.from({ length: 24 }).map((_, i) => {
          const label =
            i === 0 ? "12 AM" :
            i < 12 ? `${i} AM` :
            i === 12 ? "12 PM" :
            `${i - 12} PM`;

          return (
            <span
              key={i}
              className="text-[10px] text-gray-400 text-ce


/* ----------------------------------------
   TOP ARTISTS BAR
-----------------------------------------*/
function TopArtistsBar({
  data,
  showAll,
  setShowAll,
}: {
  data: BarDataPoint[];
  showAll: boolean;
  setShowAll: (v: boolean) => void;
}) {
  const artistsToShow = showAll ? data.slice(0, 10) : data.slice(0, 5);

  return (
    <div className="bg-[#11121c] p-6 rounded-3xl shadow-xl border border-white/10 text-white">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Top Artists</h2>

        <button
          onClick={() => setShowAll(!showAll)}
          className="px-3 py-1 rounded-full bg-[#1b1d2c] border border-white/10 text-white/70 text-sm"
        >
          {showAll ? "Show Top 5" : "Show Top 10"}
        </button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={artistsToShow} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          <XAxis
  stroke="#ffffff90"
  type="number"
  label={{
    value: "Track Plays",
    position: "insideBottom",
    offset: -5,
    fill: "#ffffff90",
  }}
/>

          <YAxis
            type="category"
            dataKey="artist"
            width={120}
            stroke="#ffffff90"
          />
          <Tooltip
          formatter={(value) => [`${value} plays`, "Play Count"]}

            contentStyle={{
              backgroundColor: "#1b1c29",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="count" fill="url(#artistGradient)" radius={[8, 8, 8, 8]} />

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

/* ----------------------------------------
   DONUT CHART – GENRES
-----------------------------------------*/
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
            formatter={(value: number, name: string) => [
  `${value}%`,
  name,
]}

            contentStyle={{
              backgroundColor: "#1b1c29",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
             itemStyle={{ color: "white" }}
            labelStyle={{ color: "white" }}
          />

          <Legend
  wrapperStyle={{ color: "white" }}
  style={{ color: "white" }}
/>


          <Pie
            data={pieData}
            dataKey="percentage"
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

   
    </div>
  );
}
/* ----------------------------------------
   MAIN DASHBOARD
-----------------------------------------*/
export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>([]);
  const [topGenres, setTopGenres] = useState<GenreItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [lineData, setLineData] = useState<LineDataPoint[]>([]);
  const [artistBarData, setArtistBarData] = useState<BarDataPoint[]>([]);
  const [pieData, setPieData] = useState<PieDataPoint[]>([]);
  const [heatmapData, setHeatmapData] = useState<number[]>(new Array(24).fill(0));

  const [expandedGenre, setExpandedGenre] = useState<string | null>(null);
  const [showAllArtists, setShowAllArtists] = useState<boolean>(false);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  /* ----------------------------------------
     FETCH DATA
  -----------------------------------------*/
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

        /* ---------- LINE CHART ---------- */
        const totals: Record<string, number> = {};
        recently.forEach((item: RecentlyPlayedItem) => {
          const date = item.played_at?.slice(0, 10);
          const ms = item["track.duration_ms"] ?? 0;
          if (!date) return;
          totals[date] = (totals[date] || 0) + ms;
        });


        setLineData(
          Object.entries(totals)
            .map(([d, ms]) => ({
              date: d,
              minutes: Math.round(ms / 60000),
            }))
            .sort((a, b) => a.date.localeCompare(b.date))
        );

        /* ---------- BAR CHART ---------- */
        const artistCounts: Record<string, number> = {};
        recently.forEach((item: RecentlyPlayedItem) => {
          const artists = item["track.artists"] ?? [];
          artists.forEach((a) => {
            artistCounts[a.name] = (artistCounts[a.name] || 0) + 1;
          });
        });


        setArtistBarData(
          Object.entries(artistCounts)
            .map(([artist, count]) => ({ artist, count }))
            .sort((a, b) => b.count - a.count)
        );

        /* ---------- PIE CHART ---------- */
      /* ---------- PIE CHART ---------- */
const genreCounts: Record<string, number> = {};
genres.forEach((g: GenreItem) => {
  const name = g.genre ?? "Unknown";
  genreCounts[name] = (genreCounts[name] || 0) + 1;
});

const sorted = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
const total = sorted.reduce((a, [, c]) => a + c, 0);

const top8 = sorted.slice(0, 8);
const others = sorted.slice(8).reduce((acc, [, v]) => acc + v, 0);

setPieData([
  ...top8.map(([g, c]) => ({
    genre: g,
    count: c,
    percentage: Number(((c / total) * 100).toFixed(1)),
  })),
  {
    genre: "Other",
    count: others,
    percentage: Number(((others / total) * 100).toFixed(1)),
  },
]);

      /* ---------- HEATMAP ---------- */
const hourBins = new Array(24).fill(0);

recently.forEach((item: RecentlyPlayedItem) => {
  const t = item.played_at;
  const ms = item["track.duration_ms"] ?? 0;
  if (!t) return;

  // Convert Spotify UTC → CST/CDT correctly
  const localTime = new Date(
    new Date(t).toLocaleString("en-US", { timeZone: "America/Chicago" })
  );

  const h = localTime.getHours();
  hourBins[h] += Math.round(ms / 60000);
});

setHeatmapData(hourBins);

      } finally {
        setLoading(false);
      }
    }

    load();
  }, [status, session]);

  /* ----------------------------------------
     RENDER
  -----------------------------------------*/
  return (
    <div className="flex min-h-screen bg-[#0d0f18] text-white">
      {/* SIDEBAR */}
      <div className="w-20 md:w-24 bg-[#0b0d14] border-r border-white/10 flex flex-col items-center py-6 gap-10">
        <Logo className="w-10 opacity-80" />
        <Sidebar />
      </div>

      {/* MAIN */}
      <main className="flex-1 px-10 py-10">
        <h1 className="text-5xl font-extrabold mb-2 tracking-tight">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 text-transparent bg-clip-text">
            Your Analytics
          </span>{" "}
          on {formattedDate}
        </h1>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
          <SimpleCard title="Recently Played" subtitle="Your latest listening">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <ul className="space-y-1 text-white/80">
                {recentlyPlayed.slice(0, 5).map((item, i) => (
                  <li key={i}>{item["track.name"] ?? "Unknown Track"}</li>
                ))}
              </ul>
            )}
          </SimpleCard>

          <SimpleCard title="Top Genres" subtitle="Detected from your listening">
            <ul className="space-y-1 text-white/80">
              {topGenres.slice(0, 5).map((g, i) => (
                <li key={i}>{g.genre ?? "Unknown"}</li>
              ))}
            </ul>
          </SimpleCard>

          
        </div>

        {/* CHARTS */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* LINE CHART */}
          <div className="bg-[#11121c] p-6 rounded-3xl shadow-xl border border-white/10">
            <h2 className="text-2xl font-bold mb-4">Daily Listening Trend</h2>
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
          </div>

          {/* TOP ARTISTS */}
          <TopArtistsBar
            data={artistBarData}
            showAll={showAllArtists}
            setShowAll={setShowAllArtists}
          />

          {/* GENRES */}
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
