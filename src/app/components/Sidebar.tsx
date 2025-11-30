"use client";
"use client";

import { Home, BarChart3, Music } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Sidebar({ active }: { active?: "home" | "mood" | "analytics" }) {
  const router = useRouter();

  const goHome = () => router.push("/");
  const goAnalytics = () => router.push("/analytics");
  const goSpotifyDashboard = () =>
    window.open("https://open.spotify.com", "_blank", "noopener,noreferrer");

  return (
    <aside className="w-[150px] bg-[#141414] flex flex-col items-center py-10 gap-10 shadow-xl">
      {/* Logo only icon or full Logo component */}
      <div className="mb-4">
        {/* could use just icon, or import LogoIcon */}
        <svg width="80" height="60" viewBox="0 0 400 200">
          {/* ... */}
        </svg>
      </div>

      <div className="flex flex-col items-center gap-8 text-white/70">
        <button
          onClick={goHome}
          className={`hover:text-white cursor-pointer transition ${
            active === "home" ? "text-white" : ""
          }`}
        >
          <Home size={28} />
        </button>

        <button
          onClick={goAnalytics}
          className={`hover:text-white cursor-pointer transition ${
            active === "analytics" ? "text-white" : ""
          }`}
        >
          <BarChart3 size={28} />
        </button>

        <button
          onClick={goSpotifyDashboard}
          className="hover:text-white cursor-pointer transition"
        >
          <Music size={28} />
        </button>
      </div>
    </aside>
  );
}
