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

/* -------------------------------------------------------------
   ICONS FOR EACH MOOD
------------------------------------------------------------- */
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

/* -------------------------------------------------------------
   FUN FACT FOR EACH MOOD
------------------------------------------------------------- */
const MOOD_FACT_MAP: Record<string, string> = {
  "Bold & Confident": "You gravitate toward empowering music that boosts confidence.",
  "Smooth & Chill": "Your listening style leans toward calm, soulful comfort.",
  "Upbeat & Fun": "You’re energized by bright, joyful, fun music.",
  "Mellow & Indie": "You enjoy low-key expressive music and creative atmospheres.",
  "High Energy": "You tend to choose fast-paced tracks that elevate your mood.",
  "Intense & Driven": "You prefer emotionally powerful or focused tracks.",
  "Chill Study Vibes": "You gravitate toward concentration-boosting lofi sounds.",
  "Vibrant & Rhythmic": "You enjoy lively rhythms and uplifting atmospheres.",
  "Calm & Peaceful": "You prefer serene, relaxing soundscapes.",
};

/* -------------------------------------------------------------
   ACTIVITIES FOR EACH MOOD (3 per mood)
------------------------------------------------------------- */
const MOOD_ACTIVITIES_MAP: Record<string, string[]> = {
  "Bold & Confident": [
    "Hit the gym or take a powerful walk",
    "Start a task you've been avoiding",
    "Make a bold choice you've been considering",
  ],
  "Smooth & Chill": [
    "Make tea and enjoy a calm moment",
    "Put on soft music and unwind",
    "Journal or reflect on your day",
  ],
  "Upbeat & Fun": [
    "Listen to your happy playlist and dance",
    "Make spontaneous plans with a friend",
    "Try a creative activity like drawing or baking",
  ],
  "Mellow & Indie": [
    "Go for a quiet walk with headphones",
    "Read or explore a cozy café",
    "Work on a personal creative project",
  ],
  "High Energy": [
    "Do a short HIIT or cardio burst",
    "Clean your space with loud music",
    "Start an ambitious mini-goal",
  ],
  "Intense & Driven": [
    "Focus deeply on your top task",
    "Write out goals for the week",
    "Channel feelings into productivity",
  ],
  "Chill Study Vibes": [
    "Do a focused study/work session",
    "Reorganize your workspace",
    "Listen to lofi while reviewing notes",
  ],
  "Vibrant & Rhythmic": [
    "Spend time outdoors in the sun",
    "Cook something flavorful with music",
    "Meet up with someone upbeat",
  ],
  "Calm & Peaceful": [
    "Try gentle yoga or stretching",
    "Meditate for 5 minutes",
    "Set up a peaceful cozy environment",
  ],
};

export default function MoodPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [moods, setMoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    if (!session || !(session as any).accessToken) return;

    setLoading(true);
    setMoods([]);

    const response: any = await fetchTopArtists((session as any).accessToken);
    const items = response?.top_artists ?? [];

    const allGenres = items.flatMap((a: any) => a.genres || []);
    const topMoods = getTopMoodsFromGenres(allGenres);

    setMoods(topMoods);
    setLoading(false);
  };

  // Group activities by mood
  const activityGroups = moods.map((m) => ({
    mood: m,
    activities: MOOD_ACTIVITIES_MAP[m] ?? [],
  }));

  return (
    <div className="w-full min-h-screen flex bg-[#1b1b1b] text-white relative">

      {/* SIDEBAR + OVERLAY LOGO */}
      <div className="relative">
        <Sidebar active="mood" />
        <div className="absolute top-6 left-6 z-50">
          <Logo width={50} height={32} />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-12">

        {/* TITLE */}
        <h1 className="text-4xl font-bold">
          <span className="bg-gradient-to-r from-[#a160ff] to-[#ff985c] bg-clip-text text-transparent">
            Mood Profile
          </span>{" "}
          On {new Date().toLocaleDateString()}:
        </h1>

        {/* REFRESH BUTTON */}
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

        {/* MAIN 70/30 LAYOUT */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[70%_30%] gap-10">

          {/* LEFT — MOOD CARDS */}
          <div className="flex flex-col gap-6">
            {moods.map((mood, idx) => (
              <div
                key={idx}
                className="bg-[#2b2b2b] p-6 rounded-xl shadow-lg flex items-center gap-6"
              >
                <div className="w-[70px] h-[70px] bg-[#ffffff15] rounded-xl flex items-center justify-center">
                  {MOOD_ICON_MAP[mood]}
                </div>

                <div>
                  <h2 className="text-2xl font-bold">{mood}</h2>
                  <p className="text-white/70 mt-1">{MOOD_FACT_MAP[mood]}</p>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — RECOMMENDED ACTIVITIES */}
          <div
            className="
              rounded-2xl p-8
              bg-gradient-to-b from-[#a160ff20] to-[#ff985c20]
              border border-transparent
              [border-image:linear-gradient(to_bottom,#a160ff,#ff985c)_1]
              shadow-lg
              h-full
            "
          >
            <h2 className="text-xl font-bold mb-6 text-white">
              Recommended Activities For You:
            </h2>

            <div className="flex flex-col gap-6">
              {activityGroups.map((group, index) => (
                <div key={index}>
                  <p className="text-lg font-semibold mb-2">
                    {group.mood}
                  </p>

                  <ol className="list-decimal list-inside text-white/80 text-sm space-y-1">
                    {group.activities.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
