"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";

interface AuthButtonProps {
  onAnalyzing?: () => void;  // ✅ typed
}

export default function AuthButton({ onAnalyzing }: AuthButtonProps) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      onAnalyzing?.(); // trigger parent analyzing screen
    }
  }, [session?.accessToken]);

  return (
    <button
      onClick={() => signIn("spotify")}
      className="spotify-button"
    >
      Sign in with Spotify
    </button>
  );
}
