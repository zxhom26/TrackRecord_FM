"use client";

import React, { useId } from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({
  width = 120,
  height = 40,
  className = "",
}: LogoProps) {
  // Generate unique ID so multiple logos don't clash gradients
  const gradientId = useId();

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 400 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Play Circle */}
      <circle cx="60" cy="80" r="40" fill={`url(#grad-${gradientId})`} />
      <polygon points="50,60 50,100 80,80" fill="white" />

      {/* Waveform Bars */}
      <rect x="130" y="50" width="20" height="80" rx="10" fill={`url(#grad-${gradientId})`} />
      <rect x="170" y="60" width="20" height="60" rx="10" fill={`url(#grad-${gradientId})`} />
      <rect x="210" y="30" width="20" height="120" rx="10" fill={`url(#grad-${gradientId})`} />
      <rect x="250" y="45" width="20" height="90" rx="10" fill={`url(#grad-${gradientId})`} />
      <rect x="290" y="35" width="20" height="110" rx="10" fill={`url(#grad-${gradientId})`} />
      <rect x="330" y="55" width="20" height="70" rx="10" fill={`url(#grad-${gradientId})`} />
      <rect x="370" y="70" width="20" height="40" rx="10" fill={`url(#grad-${gradientId})`} />

      {/* Gradient Definition */}
      <defs>
        <linearGradient id={`grad-${gradientId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a160ff" />
          <stop offset="100%" stopColor="#ff985c" />
        </linearGradient>
      </defs>
    </svg>
  );
}
