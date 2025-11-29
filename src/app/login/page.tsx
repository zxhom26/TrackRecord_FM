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

      {/* ================== TOP BAR (Logo + Login Button) ================== */}
      <div className="absolute top-0 left-0 w-full flex items-center justify-between px-8 py-6 z-20">

        {/* LOGO */}
        <div className="flex items-center gap-3">
          <svg width="60" height="40" viewBox="0 0 200 100">
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

        {/* LOGIN BUTTON */}
        <div>
          <AuthButton />
        </div>
      </div>

      {/* ================== BACKGROUND IMAGE (90% of screen) ================== */}
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
            {/* ================== OVERLAY TEXT (RIGHT-ALIGNED) ================== */}
      <div className="absolute bottom-24 right-16 z-20 text-right max-w-xl">

        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Meet Your <br />
          <span className="bg-gradient-to-r from-[#a160ff] to-[#ff985c] bg-clip-text text-transparent">
            Musical Identity.
          </span>
        </h1>

        <p className="text-lg mt-4 text-white/80">
          Explore your listening patterns, discover your mood profile,  
          and dive into the sound that makes you—you.
        </p>

      </div>


    </div>
  );
}
