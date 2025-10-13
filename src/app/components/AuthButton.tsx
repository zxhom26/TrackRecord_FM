'use client'; // required for client-side components in Next.js App Router

import { useSession, signIn, signOut } from "next-auth/react"; // stuff from NextAuth
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function AuthButton() {
  const { data: session } = useSession(); // get the current session
  const router = useRouter();
  const [fadeOut, setFadeOut] = useState(false);

  // Case: if user is logged in
  useEffect(() => {
  if (session) {
    const timer = setTimeout(()=> setFadeOut(true), 1500);
    const redirectTimer = setTimeout (()=> router.push("/"), 3000);

  return () => {
    clearTimeout(timer);
    clearTimeout(redirectTimer);
  };
}
 }, [session, router]);

 if (session) {
   return (
      <h1 className={fadeOut ? "fade-out" : ""}>Analyzing...</h1>
    );
  }

  // If user is not logged in
  return (
    <button onClick={() => signIn("spotify")}
    className="spotify-button"
    >
      <span>Login with Spotify</span>
    </button>
  );
}
