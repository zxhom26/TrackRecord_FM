"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

import {
  fetchRecentlyPlayed,
  fetchTopGenres,
  fetchRecommendations,
} from "../../utils"; // <-- CORRECT PATH

import Sidebar from "../components/Sidebar"; // <-- CORRECT PATH

// Recharts
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

// -------------------- TYPES --------------------

interface PlayedTrack {
  played_at?: string;
  track?: {
    name?: string;
    popularity?: number;
    album?: {
      images?: { url: string }[];
    };
    artists?: { name: string }[];
  };
  [key: string]: unknown; // allows flattened Spotify keys
}

interface GenreItem {
  genre?: string;
  [key: string]: unknown;
}

interface RecommendationItem {
  id?: string;
  name?: string;
  artists?: { name: string }[];
  album?: { images?: { url: string }[] };
  [key: string]: unknown;
}

// -------------------- HELPERS --------------------

function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const GENRE_COLORS = [
  "#7dd3fc",
  "#a5b4fc",
  "#f9a8d4",
  "#f97373",
  "#facc15",
  "#4ade80",
];

// -------------------- COMPONENTS --------------------

function ListeningLineChart({ data }: { data: PlayedTrack[] }) {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    const buckets: Record<string, number> = {};

    data.forEach((item) => {
      const rawTime = item.played_at;
      if (!rawTime) return;

      const d = new Date(rawTime);
      if (isNaN(d.getTime())) return;

      const hourLabel = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      });

      buckets[hourLabel] = (buckets[hourLabel] || 0) + 1;
    });

    return Object.entries(buckets).map(([hour, plays]) => ({
      hour,
      plays,
    }));
  }, [data]);

  if (!chartData.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-300">
        Not enough listening history yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="hour" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="plays"
          stroke="#a5b4fc"
          strokeWidth={2.2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function GenrePieChart({ genres }: { genres: GenreItem[] }) {
  const genreData = useMemo(() => {
    if (!Array.isArray(genres)) return [];

    const counts: Record<string, number> = {};

    genres.forEach((g) => {
      const name = g.genre?.toLowerCase();
      if (!name) return;
      counts[name] = (counts[name] || 0) + 1;
    });

    const topEntries = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const mapped = topEntries.map(([name, value]) => ({
      name,
      value,
    }));

    const otherTotal = Object.entries(counts)
      .slice(5)
      .reduce((acc, [, v]) => acc + v, 0);

    if (otherTotal > 0) {
      mapped.push({ name: "other", value: otherTotal });
    }

    return mapped;
  }, [genres]);

  if (!genreData.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-300">
        No genre analytics yet.
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
          outerRadius={90}
          innerRadius={50}
        >
          {genreData.map((_, i) => (
            <Cell key={i} fill={GENRE_COLORS[i % GENRE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

function RecommendationsCard({ recs }: { recs: RecommendationItem[] }) {
  if (!recs.length) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-300 text-sm">
        No recommendations available yet.
      </div>
    );
  }

  const topFive = recs.slice(0, 5);

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-4 text-xl font-semibold text-white">
        Recommended For You
      </h2>

      <div className="flex flex-col gap-3">
        {topFive.map((track) => {
          const img =
            track.album?.images?.[0]?.url ?? "/placeholder_album.png";

          const name = track.name ?? "Unknown Track";
          const artist = track.artists?.[0]?.name ?? "Unknown Artist";

          return (
            <div
              key={track.id ?? `${name}-${artist}`}
              className="flex items-center gap-3 rounded-full bg-rose-100/70 px-3 py-2 shadow-sm"
            >
              <Image
                src={img}
                alt={name}
                width={40}
                height={40}
                className="rounded-full object-cover"
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
    </div>
  );
}

// -------------------- MAIN PAGE --------------------

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [recentlyPlayed, setRecentlyPlayed] = useState<PlayedTrack[]>([]);
  const [topGenres, setTopGenres] = useState<GenreItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const formattedDate = getFormattedDate();

  useEffect(() => {
    if (!session?.accessToken) return;

    async function load() {
      try {
        setLoading(true);

        const [rp, tg, rc] = await Promise.all([
          fetchRecentlyPlayed(session.accessToken),
          fetchTopGenres(session.accessToken),
          fetchRecommendations(session.accessToken),
        ]);

        setRecentlyPlayed(rp.recently_played ?? []);
        setTopGenres(tg.top_genres ?? []);
        setRecommendations(rc.recommendations ?? []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        Loading…
      </div>
    );
  }

  if (!session?.accessToken) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        Please log in with Spotify first.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050816] text-white">
      <Sidebar />

      <main className="flex-1 px-10 py-8">
        <h1 className="mb-10 bg-gradient-to-r from-purple-400 via-pink-300 to-orange-300 bg-clip-text text-4xl font-extrabold text-transparent md:text-5xl">
          Your Analytics On {formattedDate}:
        </h1>

        {loading && (
          <p className="mb-4 text-sm text-zinc-300">
            Fetching your analytics…
          </p>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Panel 1 */}
          <div className="h-[320px] rounded-3xl bg-gradient-to-br from-purple-500/40 via-purple-400/20 to-indigo-500/30 p-5">
            <h2 className="mb-2 text-lg font-semibold">Listening Activity</h2>
            <p className="mb-4 text-xs text-zinc-300">
              Songs you&apos;ve played recently.
            </p>
            <div className="h-[220px]">
              <ListeningLineChart data={recentlyPlayed} />
            </div>
          </div>

          {/* Panel 2 */}
          <div className="h-[320px] rounded-3xl bg-gradient-to-br from-pink-500/40 via-rose-400/20 to-purple-500/30 p-5">
            <h2 className="mb-2 text-lg font-semibold">Top Genres</h2>
            <p className="mb-4 text-xs text-zinc-300">
              Based on your top artists.
            </p>
            <div className="h-[220px]">
              <GenrePieChart genres={topGenres} />
            </div>
          </div>

          {/* Panel 3 */}
          <div className="h-[320px] rounded-3xl bg-gradient-to-br from-rose-400/50 via-rose-300/30 to-amber-300/40 p-5">
            <RecommendationsCard recs={recommendations} />
          </div>
        </div>
      </main>
    </div>
  );
}
