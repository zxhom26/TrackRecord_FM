"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AuthButton from "../components/AuthButton";
import Image from "next/image";

export default function LoginPage() {
  const { data: session } = useSession();
  const [analyzing, setAnalyzing] = useState(false);

  // Redirect when accessToken appears
  useEffect(() => {
    if (session?.accessToken) {
      setAnalyzing(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }
  }, [session?.accessToken]);

  // === ANALYZING SCREEN ===
  if (analyzing) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <h1 className="text-white text-4xl animate-pulse">Analyzing…</h1>
      </div>
    );
  }

  // === NORMAL LOGIN SCREEN ===
  return (
    <div className="relative min-h-screen w-full bg-[#1b1b1b] text-white overflow-hidden">

      {/* ================== TOP BAR ================== */}
      <div className="w-full flex items-center justify-between px-8 pt-6 relative z-20">

        {/* LOGO */}
        <div className="flex items-center gap-3">
          <svg
            width="120"
            height="40"
            viewBox="0 0 400 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="60" cy="80" r="40" fill="url(#grad)" />
            <polygon points="50,60 50,100 80,80" fill="white" />

            <rect x="130" y="50" width="20" height="80" rx="10" fill="url(#grad)" />
            <rect x="170" y="60" width="20" height="60" rx="10" fill="url(#grad)" />
            <rect x="210" y="30" width="20" height="120" rx="10" fill="url(#grad)" />
            <rect x="250" y="45" width="20" height="90" rx="10" fill="url(#grad)" />
            <rect x="290" y="35" width="20" height="110" rx="10" fill="url(#grad)" />
            <rect x="330" y="55" width="20" height="70" rx="10" fill="url(#grad)" />
            <rect x="370" y="70" width="20" height="40" rx="10" fill="url(#grad)" />

            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a160ff" />
                <stop offset="100%" stopColor="#ff985c" />
              </linearGradient>
            </defs>
          </svg>

          <span className="text-xl font-semibold tracking-wide text-white/95">
            TrackRecord FM
          </span>
        </div>

        {/* LOGIN BUTTON */}
        <AuthButton />
      </div>

      {/* ================== BACKGROUND IMAGE ================== */}
      <div className="absolute bottom-0 left-0 w-full h-[90vh] z-0">
        <Image
          src="/laptop-full.png"
          alt="Laptop Full Background"
          fill
          priority
          className="object-cover opacity-100"
        />
      </div>

      {/* ================== OVERLAY TEXT ================== */}
      <div className="absolute top-1/2 right-16 -translate-y-1/2 z-20 text-right max-w-xl">

        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Meet Your <br />
          <span className="bg-gradient-to-r from-[#a160ff] to-[#ff985c] bg-clip-text text-transparent">
            Musical Identity.
          </span>
        </h1>

        <p className="text-lg mt-4 text-white/90 font-semibold">
          Explore your listening patterns, discover your mood profile,
          and dive into the sound that makes you—you.
        </p>

      </div>

    </div>
  );
}
