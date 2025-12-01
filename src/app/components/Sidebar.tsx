"use client";

import { Home, BarChart3, Music, Brain } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Sidebar({
  active,
}: {
  active?: "home" | "mood" | "dashboard";
}) {
  const router = useRouter();

  const goHome = () => router.push("/");
  const goDashboard = () => router.push("/dashboard");
  const goMood = () => router.push("/mood");
  const goSpotifyDashboard = () =>
    window.open("https://open.spotify.com", "_blank", "noopener,noreferrer");

  return (
    <aside className="w-[120px] bg-[#141414] min-h-screen flex flex-col items-center py-10 gap-10 shadow-xl">

      {/* ======= Logo (top-left) ======= */}
      <div className="mb-4">
        <svg width="70" height="50" viewBox="0 0 400 200">
          {/* Optional placeholder — you can replace with your <Logo /> */}
        </svg>
      </div>

      {/* ======= Navigation Icons ======= */}
      <div className="flex flex-col items-center gap-10 text-white/70">
        
        {/* HOME */}
        <button
          onClick={goHome}
          className={`hover:text-white transition ${
            active === "home" ? "text-white" : ""
          }`}
        >
          <Home size={32} />
        </button>

        {/* DASHBOARD (Analytics) */}
        <button
          onClick={goDashboard}
          className={`hover:text-white transition ${
            active === "dashboard" ? "text-white" : ""
          }`}
        >
          <BarChart3 size={32} />
        </button>

        {/* MOOD */}
        <button
          onClick={goMood}
          className={`hover:text-white transition ${
            active === "mood" ? "text-white" : ""
          }`}
        >
          <Brain size={32} />
        </button>

        {/* SPOTIFY LINK */}
        <button
          onClick={goSpotifyDashboard}
          className="hover:text-white transition"
        >
          <Music size={32} />
        </button>
      </div>
    </aside>
  );
}
