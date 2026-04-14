'use client';

import React from 'react';

interface AurbitLogoProps {
  size?: number;
  className?: string;
}

export default function AurbitLogo({ size = 48, className = '' }: AurbitLogoProps) {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Outer Orbit Ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#orbitGradient)"
          strokeWidth="1.5"
          strokeDasharray="10 5"
          className="opacity-40"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="20s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Inner Orbit Ring */}
        <circle
          cx="50"
          cy="50"
          r="30"
          stroke="url(#orbitGradient)"
          strokeWidth="2"
          className="opacity-60"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 50 50"
            to="0 50 50"
            dur="15s"
            repeatCount="indefinite"
          />
        </circle>

        {/* The Core 'A' */}
        <path
          d="M50 20L80 80H70L50 40L30 80H20L50 20Z"
          fill="url(#coreGradient)"
          className="drop-shadow-lg"
        />
        <path
          d="M42 60H58V65H42V60Z"
          fill="white"
          fillOpacity="0.8"
        />

        {/* Orbiting Moon */}
        <circle cx="50" cy="5" r="4" fill="#4ade80">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>

        <defs>
          <linearGradient id="coreGradient" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4ade80" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="orbitGradient" x1="5" y1="50" x2="95" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4ade80" stopOpacity="0" />
            <stop offset="0.5" stopColor="#4ade80" />
            <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
