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
interface SpotifyArtist {
  name: string;
}

interface RecentlyPlayedItem {
  played_at?: string;
  "track.duration_ms"?: number;
  "track.name"?: string;
  "track.artists"?: SpotifyArtist[];
  "track.genres"?: string[];
  [key: string]: unknown;
}

interface GenreItem {
  genre: string | null;
}

interface RecommendationItem {
  name: string;
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
  if (!genre || genre === "Other") return null;

  const artistCount: Record<string, number> = {};

 recentlyPlayed.forEach((item: RecentlyPlayedItem) => {
  const genres = item["track.genres"];
  if (!Array.isArray(genres)) return;

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

  return (
    <div>
      {/* 2-row layout */}
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
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
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
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          );
        })}
      </div>

      {/* Label row */}
      <div className="flex justify-between mt-2 text-white/50 text-xs">
        {Array.from({ length: 24 }).map((_, i) => {
  let label = "";
  if (i === 0) label = "12 AM";
  else if (i < 12) label = `${i} AM`;
  else if (i === 12) label = "12 PM";
  else label = `${i - 12} PM`;

  return <span key={i}>{label}</span>;
})}

      </div>
    </div>
  );
}

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
              color: "white",
              borderRadius: "8px",
            }}
          />

          <Legend wrapperStyle={{ color: "white" }} />

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

      {expandedGenre && (
        <GenreDetailSection
          genre={expandedGenre}
          recentlyPlayed={recentlyPlayed}
        />
      )}
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
          const h = new Date(t).getHours();
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">
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

          <SimpleCard title="Recommendations" subtitle="Curated for you">
            <ul className="space-y-1 text-white/80">
              {recommendations.slice(0, 5).map((r, i) => (
                <li key={i}>{r.name ?? "Unknown"}</li>
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
