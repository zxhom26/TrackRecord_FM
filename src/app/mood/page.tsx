"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import Sidebar from "../components/Sidebar";
import Logo from "../components/Logo";

import { fetchTopArtists, getTopMoodsFromGenres } from "../../utils";

import {
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

    const allGenres = items.flatMap(a => a.genres || []);
    const topMoods = getTopMoodsFromGenres(allGenres);

    setMoods(topMoods);
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen flex bg-[#1b1b1b] text-white">

      {/* Sidebar */}
      <Sidebar active="mood" />

      {/* Main Content */}
      <main className="flex-1 p-12">

        {/* Header Title */}
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

        {/* Mood Cards */}
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

              {/* Text */}
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
