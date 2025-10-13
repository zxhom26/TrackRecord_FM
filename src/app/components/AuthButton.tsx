'use client'; // required for client-side components in Next.js App Router

import { useSession, signIn, signOut } from "next-auth/react"; // stuff from NextAuth

export default function AuthButton() {
  const { data: session } = useSession(); // get the current session

  // Case: if user is logged in
  if (session) {
    return (
      <div>
        <p>Welcome!</p> 
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    );
  }

  // If user is not logged in
  return (
    <button onClick={() => signIn("spotify")}>
      Sign in with Spotify
    </button>
  );
}