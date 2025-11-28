"use client";

import Image from "next/image";
import AuthButton from "../components/AuthButton"; // ⭐ BRING BACK AUTHBUTTON

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#1b1b1b] text-white flex flex-col p-8 relative">

      {/* ================= LOGO ================= */}
      <div className="flex items-center gap-3 mb-10">
        <svg width="55" height="35" viewBox="0 0 200 100">
          <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a160ff" />
              <stop offset="100%" stopColor="#ff985c" />
            </linearGradient>
          </defs>

          <circle cx="28" cy="50" r="12" fill="url(#logoGradient)" />
          <rect x="60" y="30" width="10" height="40" fill="url(#logoGradient)" rx="3" />
          <rect x="80" y="20" width="10" height="60" fill="url(#logoGradient)" rx="3" />
          <rect x="100" y="10" width="10" height="80" fill="url(#logoGradient)" rx="3" />
          <rect x="120" y="25" width="10" height="50" fill="url(#logoGradient)" rx="3" />
          <rect x="140" y="35" width="10" height="30" fill="url(#logoGradient)" rx="3" />
        </svg>

        <span className="text-xl font-semibold tracking-wide text-white/95">
          TrackRecord FM
        </span>
      </div>

      {/* ================= LOGIN BUTTON (using AuthButton) ================= */}
      <div className="absolute top-8 right-8">
        <div
          className="
            px-6 py-2 rounded-full
            bg-gradient-to-r from-[#50d784] to-[#25b76b]
            shadow-[0_0_12px_rgba(80,215,132,0.55)]
            hover:shadow-[0_0_18px_rgba(80,215,132,0.75)]
            transition-all duration-300
          "
        >
          {/* ⭐ Replace the raw button with your component */}
          <AuthButton />
        </div>
      </div>

      {/* ================= WAVE ================= */}
      <div className="absolute top-[180px] left-0 w-full overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 1600 400"
          preserveAspectRatio="none"
          className="w-full h-[300px] opacity-[0.35]"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6a3ff8" />
              <stop offset="100%" stopColor="#ff985c" />
            </linearGradient>
          </defs>

          <path
            d="
              M0 200 
              C250 100 450 300 700 200
              S1150 100 1400 200
              S1650 300 1900 200
            "
            stroke="url(#waveGradient)"
            strokeWidth="110"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="relative flex flex-col md:flex-row items-center gap-12 md:gap-20 mt-10">

        {/* LAPTOP MOCK */}
        <div className="relative z-10">
          <Image
            src="/laptop-mock.png"
            alt="Laptop Preview"
            width={580}
            height={380}
            className="rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.55)] contrast-[1.2] brightness-[1.1]"
          />
        </div>

        {/* TEXT */}
        <div className="z-10 flex flex-col items-start max-w-lg mt-6 md:mt-0">
          <h1 className="text-5xl md:text-6xl font-semibold leading-tight">
            Meet Your <br />
            <span className="bg-gradient-to-r from-[#a160ff] to-[#ff985c] bg-clip-text text-transparent">
              Musical Identity.
            </span>
          </h1>

          <p className="text-lg mt-4 text-white/80 max-w-sm">
            Explore your listening patterns, discover your mood profile,
            and dive into the sound that makes you—you.
          </p>
        </div>

      </div>
    </div>
  );
}
