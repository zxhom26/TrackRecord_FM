"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import {
  fetchRecentlyPlayed,
  fetchTopGenres,
  fetchRecommendations,
} from "../../utils";

import Sidebar from "../components/sidebar";
import Logo from "../components/Logo";

// -------------------- TYPES --------------------

interface PlayedTrack {
  [key: string]: unknown;
}

interface GenreItem {
  genre?: string | null;
  [key: string]: unknown;
}

interface RecommendationItem {
  id?: string | number;
  name?: string | null;
  artists?: { name?: string | null }[];
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

// Try to pull a reasonable label from a generic object
function getSafeStringField(
  obj: { [key: string]: unknown },
  keys: string[],
  fallback: string
): string {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return fallback;
}

// -------------------- PAGE --------------------

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [recentlyPlayed, setRecentlyPlayed] = useState<PlayedTrack[]>([]);
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [recs, setRecs] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const formattedDate = getFormattedDate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const token = session?.accessToken;
        if (!token) {
          setRecentlyPlayed([]);
          setGenres([]);
          setRecs([]);
          return;
        }

        const [rp, tg, rc] = await Promise.all([
          fetchRecentlyPlayed(token),
          fetchTopGenres(token),
          fetchRecommendations(token),
        ]);

        const rpArray = Array.isArray(rp?.recently_played)
          ? (rp.recently_played as PlayedTrack[])
          : [];
        const tgArray = Array.isArray(tg?.top_genres)
          ? (tg.top_genres as GenreItem[])
          : [];
        const rcArray = Array.isArray(rc?.recommendations)
          ? (rc.recommendations as RecommendationItem[])
          : [];

        setRecentlyPlayed(rpArray);
        setGenres(tgArray);
        setRecs(rcArray);
      } catch {
        // On any error, just clear data; we don’t want the UI to crash
        setRecentlyPlayed([]);
        setGenres([]);
        setRecs([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [session?.accessToken]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050816] text-white">
        Loading…
      </div>
    );
  }

  if (!session?.accessToken) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050816] text-white">
        Please log in with Spotify to view your analytics.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050816] text-white">
      {/* SIDEBAR + LOGO COLUMN */}
      <div className="relative flex-shrink-0">
        <div className="absolute top-4 left-4 z-20">
          <Logo />
        </div>
        <div className="h-full">
          <Sidebar />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-10 py-8">
        {/* Title + Date (date text white) */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
          <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-orange-300 bg-clip-text text-transparent">
            Your Analytics
          </span>
        </h1>
        <p className="text-lg text-white mb-8">On {formattedDate}</p>

        {loading && (
          <p className="mb-4 text-sm text-white/70">
            Checking your Spotify data…
          </p>
        )}

        {/* ====================== 3 FEATURE CARDS ====================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-4">
          {/* =============== RECENTLY PLAYED CARD =============== */}
          <div
            className="
              rounded-3xl p-10
              bg-[#6a3ff815] backdrop-blur-md
              border border-white/10 shadow-xl
              hover:scale-[1.03] hover:border-white/20
              transition-all cursor-default
              flex flex-col gap-4
              min-h-[280px]
            "
          >
            <h2 className="text-2xl font-semibold">Recently Played</h2>
            <p className="text-white/80 text-sm">
              A quick peek at what you&apos;ve been listening to lately.
            </p>

            {recentlyPlayed.length === 0 ? (
              <p className="mt-4 text-sm text-white/60">
                No recently played data available yet.
              </p>
            ) : (
              <div className="mt-4 text-sm text-white/85 w-full">
                <p className="mb-2 text-white/70">
                  Total items: {recentlyPlayed.length}
                </p>
                <ul className="space-y-2">
                  {recentlyPlayed.slice(0, 5).map((item, idx) => {
                    const label = getSafeStringField(
                      item,
                      [
                        "track.name",
                        "song_name",
                        "name",
                      ],
                      "Unknown track"
                    );

                    return (
                      <li
                        key={idx}
                        className="px-3 py-2 rounded-full bg-white/5 border border-white/10"
                      >
                        {label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* =============== TOP GENRES CARD =============== */}
          <div
            className="
              rounded-3xl p-10
              bg-[#ff88d715] backdrop-blur-md
              border border-white/10 shadow-xl
              hover:scale-[1.03] hover:border-white/20
              transition-all cursor-default
              flex flex-col gap-4
              min-h-[280px]
            "
          >
            <h2 className="text-2xl font-semibold">Top Genres</h2>
            <p className="text-white/80 text-sm">
              Genres detected directly from your top artists.
            </p>

            {genres.length === 0 ? (
              <p className="mt-4 text-sm text-white/60">
                No genre data available.
              </p>
            ) : (
              <div className="mt-4 text-sm text-white/85 w-full">
                <p className="mb-2 text-white/70">
                  Total items: {genres.length}
                </p>
                <ul className="space-y-2">
                  {genres.slice(0, 6).map((g, idx) => (
                    <li
                      key={idx}
                      className="px-3 py-2 rounded-full bg-white/5 border border-white/10"
                    >
                      {g.genre ?? "(unknown genre)"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* =============== RECOMMENDATIONS CARD =============== */}
          <div
            className="
              rounded-3xl p-10
              bg-[#ff987515] backdrop-blur-md
              border border-white/10 shadow-xl
              hover:scale-[1.03] hover:border-white/20
              transition-all cursor-default
              flex flex-col gap-4
              min-h-[280px]
            "
          >
            <h2 className="text-2xl font-semibold">Recommendations</h2>
            <p className="text-white/80 text-sm">
              Tracks your backend is suggesting right now.
            </p>

            {recs.length === 0 ? (
              <p className="mt-4 text-sm text-white/60">
                No recommendations available yet.
              </p>
            ) : (
              <div className="mt-4 text-sm text-white/85 w-full">
                <p className="mb-2 text-white/70">
                  Total items: {recs.length}
                </p>
                <ul className="space-y-2">
                  {recs.slice(0, 5).map((r, idx) => {
                    const name =
                      typeof r.name === "string" && r.name.trim().length > 0
                        ? r.name
                        : "Unknown track";

                    const artist =
                      Array.isArray(r.artists) &&
                      r.artists[0] &&
                      typeof r.artists[0].name === "string"
                        ? r.artists[0].name
                        : "Unknown artist";

                    return (
                      <li
                        key={r.id ?? idx}
                        className="px-3 py-2 rounded-full bg-white/5 border border-white/10 flex flex-col"
                      >
                        <span className="font-semibold">{name}</span>
                        <span className="text-xs text-white/70">
                          {artist}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
