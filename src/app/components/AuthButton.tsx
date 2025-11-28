"use client";

import { signIn } from "next-auth/react";

export default function AuthButton() {
  return (
    <button
      className="
        px-6 py-2 rounded-full
        text-white font-semibold text-lg
        bg-gradient-to-r from-[#50d784] to-[#25b76b]
        shadow-[0_0_12px_rgba(80,215,132,0.55)]
        hover:shadow-[0_0_18px_rgba(80,215,132,0.75)]
        transition-all duration-300
      "
      onClick={() => signIn("spotify")}
    >
      Log In 
    </button>
  );
}
