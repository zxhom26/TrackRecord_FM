"use client"; // client component -- displays on client side 

import AuthButton from "../components/AuthButton"; // importing AuthButton component to redirect to Spotify Login upon click
import "./login.css"; // importing stylistic elements

export default function LoginPage() {
  return (
    <main className="login-page">
      {/* Waveform SVG */}
      <div className="waveform">
        <svg
          width="400"
          height="120"
          viewBox="0 0 400 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Play circle */}
          <circle cx="30" cy="60" r="22" fill="url(#grad)" />
          <polygon points="25,48 25,72 45,60" fill="#ffffff" />

          {/* Music Bars */}
          <rect x="70" y="30" width="10" height="60" rx="5" fill="url(#grad)" />
          <rect x="90" y="40" width="10" height="40" rx="5" fill="url(#grad)" />
          <rect x="110" y="20" width="10" height="80" rx="5" fill="url(#grad)" />
          <rect x="130" y="45" width="10" height="30" rx="5" fill="url(#grad)" />
          <rect x="150" y="50" width="10" height="20" rx="5" fill="url(#grad)" />

          <rect x="170" y="35" width="10" height="50" rx="5" fill="url(#grad)" />
          <rect x="190" y="45" width="10" height="30" rx="5" fill="url(#grad)" />
          <rect x="210" y="25" width="10" height="70" rx="5" fill="url(#grad)" />
          <rect x="230" y="45" width="10" height="30" rx="5" fill="url(#grad)" />
          <rect x="250" y="35" width="10" height="50" rx="5" fill="url(#grad)" />

          <rect x="270" y="50" width="10" height="20" rx="5" fill="url(#grad)" />
          <rect x="290" y="40" width="10" height="40" rx="5" fill="url(#grad)" />
          <rect x="310" y="20" width="10" height="80" rx="5" fill="url(#grad)" />
          <rect x="330" y="40" width="10" height="40" rx="5" fill="url(#grad)" />
          <rect x="350" y="55" width="10" height="10" rx="5" fill="url(#grad)" />

          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a160ff" />
              <stop offset="100%" stopColor="#ff985c" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <h1 className="login-title">Welcome to TrackRecordFM</h1>

      <AuthButton />
    </main>
  );
}
