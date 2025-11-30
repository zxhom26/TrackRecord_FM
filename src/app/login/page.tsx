"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AuthButton from "../components/AuthButton";
import Image from "next/image";
import Logo from "../components/Logo";

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

        {/* LOGO COMPONENT */}
        <div className="flex items-center gap-3">
          <Logo width={120} height={40} />
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
          and dive into the sound that makes you, YOU.
        </p>

      </div>

    </div>
  );
}
