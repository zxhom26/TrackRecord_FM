'use client'; // required for client-side components in Next.js App Router

import { useSession, signIn } from "next-auth/react"; // stuff from NextAuth
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function AuthButton() {
  const { data: session } = useSession(); // get the current session
  const router = useRouter();
  const [showAnalyzing, setShowAnalyzing] = useState(false); // ADDED THIS

  // Case: if user logs in -- redirect to home after 3000 milliseconds
  useEffect(()=> {
    if (session){
      setShowAnalyzing(true); // ADDED THIS
      const timer = setTimeout(() => { // ADDED THIS
      router.push("/");
    }, 3000); // ADDED THIS
    return () => clearTimeout(timer) // ADDED THIS
  }
  }, [session, router]);

  if (session && showAnalyzing) { // ADDED THIS BLOCK
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

  // If user is not logged in
  return (
    <button className="spotify-button" onClick={() => signIn("spotify")}>
      Sign in with Spotify
    </button>
  );
}