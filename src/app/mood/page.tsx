"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchTopArtists, getTopMoodsFromGenres } from "../../utils";

import {
  Home,
  User,
  BarChart3,
  Music,
  RefreshCw,
  Flame,
  Cloud,
  PartyPopper,
} from "lucide-react";

// Mood → Icon map
const MOOD_ICON_MAP: Record<string, React.ReactNode> = {
  "🔥 Bold & Confident": <Flame size={42} className="text-red-400" />,
  "💙 Smooth & Chill": <Cloud size={42} className="text-blue-400" />,
  "🎉 Upbeat & Fun": <PartyPopper size={42} className="text-purple-400" />,
  "🌿 Mellow & Indie": <Cloud size={42} className="text-green-400" />,
  "⚡ High Energy": <Flame size={42} className="text-yellow-300" />,
  "🤘 Intense & Driven": <Flame size={42} className="text-orange-400" />,
  "📚 Chill Study Vibes": <Cloud size={42} className="text-indigo-300" />,
  "💃 Vibrant & Rhythmic": <PartyPopper size={42} className="text-pink-400" />,
  "🌙 Calm & Peaceful": <Cloud size={42} className="text-sky-300" />,
};

interface SpotifyArtist {
  name: string;
  genres: string[];
}

export default function MoodPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [moods, setMoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    setMoods([]);

    const response = await fetchTopArtists(session.accessToken);
    const items: SpotifyArtist[] = response?.top_artists ?? [];

    const allGenres = items.flatMap((artist: SpotifyArtist) => artist.genres);
    const topMoods = getTopMoodsFromGenres(allGenres);

    setMoods(topMoods);
    setLoading(false);
  };

  // Redirect handlers
  const goProfile = () => router.push("/profile");
  const goHome = () => router.push("/");
  const goAnalytics = () => router.push("/analytics");
  const goMood = () => router.push("/mood");
  const goSpotify = () =>
    window.open("https://open.spotify.com", "_blank");

  return (
    <div className="w-full min-h-screen flex bg-[#1b1b1b] text-white">

      {/* ================== SIDEBAR ================== */}
      <aside
        className="
          w-[150px]
          bg-[#141414]
          flex flex-col
          items-center
          py-10
          gap-10
          shadow-xl
        "
      >
        {/* Logo */}
        <div>
          <svg width="80" height="60" viewBox="0 0 400 200">
            {/* Play circle */}
            <circle cx="60" cy="80" r="40" fill="url(#grad)" />
            <polygon points="50,60 50,100 80,80" fill="white" />

            {/* Waveform bars */}
            <rect x="130" y="50" width="20" height="80" rx="10" fill="url(#grad)" />
            <rect x="170" y="60" width="20" height="60" rx="10" fill="url(#grad)" />
            <rect x="210" y="30" width="20" height="120" rx="10" fill="url(#grad)" />
            <rect x="250" y="45" width="20" height="90" rx="10" fill="url(#grad)" />
            <rect x="290" y="35" width="20" height="110" rx="10" fill="url(#grad)" />

            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a160ff" />
                <stop offset="100%" stopColor="#ff985c" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Sidebar Icons (with redirects) */}
        <div className="flex flex-col items-center gap-8 text-white/70">

          {/* PROFILE */}
          <User
            size={28}
            className="hover:text-white cursor-pointer"
            onClick={goProfile}
          />

          {/* HOME */}
          <Home
            size={28}
            className="hover:text-white cursor-pointer"
            onClick={goHome}
          />

          {/* ANALYTICS */}
          <BarChart3
            size={28}
            className="hover:text-white cursor-pointer"
            onClick={goAnalytics}
          />

          {/* SPOTIFY */}
          <Music
            size={28}
            className="hover:text-white cursor-pointer"
            onClick={goSpotify}
          />

          {/* MOOD (current page) */}
          <Flame
            size={28}
            className="hover:text-white cursor-pointer mt-4"
            onClick={goMood}
          />
        </div>
      </aside>

      {/* ================== MAIN CONTENT ================== */}
      <main className="flex-1 p-12">

        {/* Page Title */}
        <h1 className="text-4xl font-bold">
          <span className="bg-gradient-to-r from-[#a160ff] to-[#ff985c] bg-clip-text text-transparent">
            Mood Profile
          </span>{" "}
          On {new Date().toLocaleDateString()}:
        </h1>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="
            flex items-center gap-2
            mt-6 px-5 py-3 rounded-full
            bg-white/10 hover:bg-white/20
            transition-all shadow
          "
        >
          <RefreshCw size={20} />
          {loading ? "Refreshing..." : "Refresh Mood Profile"}
        </button>

        {/* ================== MOOD CARDS ================== */}
        <div className="mt-10 flex flex-col gap-6 max-w-3xl">
          {moods.map((mood, idx) => (
            <div
              key={idx}
              className="
                bg-[#2b2b2b]
                p-6 rounded-xl
                shadow-lg flex items-center gap-6
              "
            >
              {/* Icon */}
              <div className="w-[70px] h-[70px] bg-[#ffffff15] rounded-xl flex items-center justify-center">
                {MOOD_ICON_MAP[mood] ?? <Flame size={42} />}
              </div>

              {/* Mood Text */}
              <div>
                <h2 className="text-2xl font-bold">{mood}</h2>
                <p className="text-white/70 mt-1">
                  Fun facts & lifestyle insights about this mood coming soon.
                </p>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
