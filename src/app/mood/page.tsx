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
  Leaf,
  Zap,
  BookOpen,
  Sun,
  Moon,
  BrainCircuit,
} from "lucide-react";

/* ============================================================
   MOOD → ICON
   ============================================================ */
const MOOD_ICON_MAP: Record<string, React.ReactNode> = {
  "Bold & Confident": <Flame size={42} className="text-red-400" />,
  "Smooth & Chill": <Cloud size={42} className="text-blue-400" />,
  "Upbeat & Fun": <PartyPopper size={42} className="text-purple-400" />,
  "Mellow & Indie": <Leaf size={42} className="text-green-400" />,
  "High Energy": <Zap size={42} className="text-yellow-300" />,
  "Intense & Driven": <BrainCircuit size={42} className="text-orange-400" />,
  "Chill Study Vibes": <BookOpen size={42} className="text-indigo-300" />,
  "Vibrant & Rhythmic": <Sun size={42} className="text-pink-400" />,
  "Calm & Peaceful": <Moon size={42} className="text-sky-300" />,
};

/* ============================================================
   MOOD → FUN FACT SUBTEXT
   ============================================================ */
const MOOD_FACT_MAP: Record<string, string> = {
  "Bold & Confident":
    "You gravitate toward empowering beats. Your playlists scream main-character energy.",
  "Smooth & Chill":
    "You love mellow tracks that keep things calm, cozy, and effortlessly cool.",
  "Upbeat & Fun":
    "You naturally bring good vibes. Your music taste is basically a serotonin booster.",
  "Mellow & Indie":
    "You enjoy thoughtful, earthy sounds. The kind of music that makes life feel cinematic.",
  "High Energy":
    "You're fueled by adrenaline. Your playlists match your go-go-go personality.",
  "Intense & Driven":
    "You love tracks with emotional depth and power; your music is your motivation.",
  "Chill Study Vibes":
    "You thrive in focus mode: your playlist is a productivity cheat code.",
  "Vibrant & Rhythmic":
    "You have rhythm in your soul. Your music taste is warm, colorful, and full of movement.",
  "Calm & Peaceful":
    "You appreciate serenity. Your playlists feel like a deep breath and a soft reset.",
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

    const allGenres = items.flatMap((a) => a.genres || []);
    const topMoods = getTopMoodsFromGenres(allGenres);

    setMoods(topMoods);
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen flex bg-[#1b1b1b] text-white relative">
      {/* SIDEBAR + LOGO OVERLAY */}
      <div className="relative">
        <Sidebar active="mood" />

        <div className="absolute top-6 left-6 z-50">
          <Logo width={50} height={32} />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-12">

        {/* Title */}
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

        {/* MOOD CARDS */}
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

              {/* Text: Mood + Fun Fact */}
              <div>
                <h2 className="text-2xl font-bold">{mood}</h2>
                <p className="text-white/70 mt-1">
                  {MOOD_FACT_MAP[mood] ??
                    "This mood says something uniquely you — more insights soon!"}
                </p>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
