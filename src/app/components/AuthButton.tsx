"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";

export default function AuthButton({ onAnalyzing }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      onAnalyzing?.(); // ⭐ notify parent to hide UI
    }
  }, [session?.accessToken]);

  // Normal button
  return (
    <button
      onClick={() => signIn("spotify")}
      className="spotify-button"
    >
      Sign in with Spotify
    </button>
  );
}
