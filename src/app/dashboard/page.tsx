"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  fetchRecentlyPlayed,
  fetchTopGenres,
  fetchRecommendations,
} from "../../utils";
// ⬆️ if utils is somewhere else, adjust this path

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Sidebar from "../components/Sidebar";

const GENRE_COLORS = [
  "#7dd3fc",
  "#a5b4fc",
  "#f9a8d4",
  "#f97373",
  "#facc15",
  "#4ade80",
];

type RecentlyPlayedItem = any;
type GenreItem = { genre?: string };
type RecommendationItem = any;

// ---------- Helper: format date for title ----------
function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ---------- Charts + Cards Components ----------

function ListeningLineChart({ data }: { data: RecentlyPlayedItem[] }) {
  // Aggregate plays per hour (last 24-ish plays)
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const buckets: Record<string, number> = {};

    data.forEach((item) => {
      const rawTime =
        item.played_at ||
        item["played_at"] ||
        item["timestamp"] ||
        item["context.time"];

      if (!rawTime) return;

      const d = new Date(rawTime);
      if (isNaN(d.getTime())) return;

      const hourLabel = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      });

      buckets[hourLabel] = (buckets[hourLabel] || 0) + 1;
    });

    // turn into sorted array by time order of appearance
    return Object.entries(buckets).map(([hour, plays]) => ({
      hour,
      plays,
    }));
  }, [data]);

  if (!chartData.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-300">
        Not enough listening data yet. Hit play on Spotify and come back!
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#020617",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />
        <Line
          type="monotone"
          dataKey="plays"
          stroke="#a5b4fc"
          strokeWidth={2.4}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function GenrePieChart({ genres }: { genres: GenreItem[] }) {
  const genreData = useMemo(() => {
    if (!genres || !Array.isArray(genres) || genres.length === 0) return [];

    const counts: Record<string, number> = {};

    genres.forEach((g) => {
      const name = (g.genre || "").toLowerCase();
      if (!name) return;
      counts[name] = (counts[name] || 0) + 1;
    });

    const entries = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const top = entries.map(([name, value]) => ({
      name,
      value,
    }));

    const otherTotal =
      Object.entries(counts)
        .slice(5)
        .reduce((acc, [, v]) => acc + v, 0) || 0;

    if (otherTotal > 0) {
      top.push({ name: "other", value: otherTotal });
    }

    return top;
  }, [genres]);

  if (!genreData.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-300">
        We couldn&apos;t detect any top genres yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={genreData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={90}
          paddingAngle={2}
        >
          {genreData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={GENRE_COLORS[index % GENRE_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any, name: any) => [`${value} plays`, name]}
          contentStyle={{
            backgroundColor: "#020617",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) =>
            value === "other" ? "Other Genres" : value.toString()
          }
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function RecommendationsCard({ recs }: { recs: RecommendationItem[] }) {
  if (!recs || !Array.isArray(recs) || recs.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-sm text-zinc-300">
        <p className="mb-1">No recommendations yet.</p>
        <p>Listen to a few songs so Spotify can learn your vibe 💜</p>
      </div>
    );
  }

  const topFive = recs.slice(0, 5);

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-4 text-xl font-semibold text-zinc-50">
        Recommended For You
      </h2>
      <div className="flex flex-col gap-3">
        {topFive.map((track: any) => {
          const image =
            track["album.images"]?.[0]?.url ||
            track.album?.images?.[0]?.url ||
            "/default_album.png";

          const name = track.name || track["name"];
          const artist =
            track?.artists?.[0]?.name ||
            track["artists.0.name"] ||
            "Unknown Artist";

          return (
            <div
              key={track.id}
              className="flex items-center gap-3 rounded-full bg-rose-100/70 px-3 py-2 shadow-sm"
            >
              <img
                src={image}
                alt={name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-900">
                  {name}
                </span>
                <span className="text-xs text-zinc-600">{artist}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-zinc-300">
        Curated from your top tracks, artists, and genres 🎧
      </p>
    </div>
  );
}

// ---------- Main Dashboard Page ----------

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>(
    []
  );
  const [topGenres, setTopGenres] = useState<GenreItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const formattedDate = getFormattedDate();

  useEffect(() => {
    if (!session?.accessToken) return;

    async function loadData() {
      try {
        setLoading(true);

        const [rp, tg, rc] = await Promise.all([
          fetchRecentlyPlayed(session.accessToken as string),
          fetchTopGenres(session.accessToken as string),
          fetchRecommendations(session.accessToken as string),
        ]);

        if (!rp.error && rp.recently_played) {
          setRecentlyPlayed(rp.recently_played);
        } else {
          setRecentlyPlayed([]);
        }

        if (!tg.error && tg.top_genres) {
          setTopGenres(tg.top_genres);
        } else {
          setTopGenres([]);
        }

        if (!rc.error && rc.recommendations) {
          setRecommendations(rc.recommendations);
        } else {
          setRecommendations([]);
        }
      } catch (err) {
        console.error("Error loading analytics:", err);
        setRecentlyPlayed([]);
        setTopGenres([]);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session]);

  // ---------- Auth guard ----------
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-200">
        Loading session...
      </div>
    );
  }

  if (!session?.accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-200">
        Please log in with Spotify to view your dashboard.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050816] text-white">
      <Sidebar />

      <main className="flex-1 px-10 py-8">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-300 to-orange-300 bg-clip-text text-transparent mb-10">
          Your Analytics On {formattedDate}:
        </h1>

        {/* Optional loading overlay */}
        {loading && (
          <div className="mb-6 text-sm text-zinc-300">
            Fetching your Spotify analytics...
          </div>
        )}

        {/* 3-panel grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Panel 1: Listening Line Chart */}
          <div className="h-[320px] rounded-[2.25rem] bg-gradient-to-br from-purple-500/40 via-purple-400/20 to-indigo-500/30 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
            <h2 className="mb-3 text-lg font-semibold text-zinc-50">
              Listening Activity
            </h2>
            <p className="mb-4 text-xs text-zinc-200">
              Songs you&apos;ve played recently, grouped by time of day.
            </p>
            <div className="h-[220px]">
              <ListeningLineChart data={recentlyPlayed} />
            </div>
          </div>

          {/* Panel 2: Genre Pie Chart */}
          <div className="h-[320px] rounded-[2.25rem] bg-gradient-to-br from-pink-500/40 via-rose-400/20 to-purple-500/30 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
            <h2 className="mb-3 text-lg font-semibold text-zinc-50">
              Top Genres
            </h2>
            <p className="mb-4 text-xs text-zinc-200">
              Your most-listened genres based on your top artists.
            </p>
            <div className="h-[220px]">
              <GenrePieChart genres={topGenres} />
            </div>
          </div>

          {/* Panel 3: Recommendations Card */}
          <div className="h-[320px] rounded-[2.25rem] bg-gradient-to-br from-rose-400/50 via-rose-300/30 to-amber-300/40 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
            <RecommendationsCard recs={recommendations} />
          </div>
        </div>
      </main>
    </div>
  );
}
