'use client';

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showAnalyzing, setShowAnalyzing] = useState(false);

  console.log("Session in AuthButton:", session);

  useEffect(() => {
    // Only trigger redirect if FULLY authenticated (token available)
    if (session?.accessToken) {
      setShowAnalyzing(true);

      const timer = setTimeout(() => {
        router.push("/");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [session?.accessToken, router]);

  // Show “Analyzing…” only when token is ready + we’re redirecting
  if (session?.accessToken && showAnalyzing) {
    return (
      <div
        style={{
          color: "#b5adde",
          fontSize: "1.5rem",
          opacity: 1,
          transition: "opacity 1s ease",
        }}
      >
        Analyzing...
      </div>
    );
  }

  // Default: user not logged in
  return (
    <button className="spotify-button" onClick={() => signIn("spotify")}>
      Sign in with Spotify
    </button>
  );
}
