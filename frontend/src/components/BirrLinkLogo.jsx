import React from 'react';
import { Link } from 'react-router-dom';

/**
 * BirrLink Modern Descriptive Logo
 * 
 * Visual Concept:
 * - Interlocking Dual-Corridor Loops: Europe Rail (Radiant Gold/Euro) ⇄ Ethiopia Rail (Emerald Green/Birr)
 * - Stylized "B" Monogram integrated with an infinite settlement bridge
 * - High-speed instant settlement lightning node in electric pure white & gold
 * - Scalable from 24px navbar badge up to hero display
 */

export function BirrLinkIcon({ size = 36, className = '' }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Luxury Emerald Base Gradient */}
          <linearGradient id="blBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#044e39" />
            <stop offset="50%" stopColor="#065f46" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          {/* Shimmering Gold Rail (Euro) */}
          <linearGradient id="blGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Vibrant Emerald Rail (Birr) */}
          <linearGradient id="blEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Bolt Glow */}
          <filter id="blGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Squircle Badge Base */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="26"
          fill="url(#blBgGrad)"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />

        {/* Ambient Top Rim Highlight */}
        <path
          d="M 16 28 C 16 18 22 10 36 8 L 64 8 C 78 10 84 18 84 28"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* LEFT LINK LOOP (Europe / Euro Rail - Warm Amber Gold) */}
        <path
          d="M 44 26 C 30 26 22 35 22 50 C 22 65 30 74 44 74 C 50 74 54 71 58 66"
          stroke="url(#blGoldGrad)"
          strokeWidth="9"
          strokeLinecap="round"
        />

        {/* RIGHT DOUBLE LOOP (Ethiopia / Birr Rail - Forming the 'B' in Emerald) */}
        {/* Top lobe */}
        <path
          d="M 44 26 H 58 C 67 26 74 32 74 40 C 74 47 68 51 59 51 H 46"
          stroke="url(#blEmeraldGrad)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Bottom lobe */}
        <path
          d="M 46 51 H 61 C 71 51 78 57 78 65 C 78 74 70 74 58 74 H 44"
          stroke="url(#blEmeraldGrad)"
          strokeWidth="9"
          strokeLinecap="round"
        />

        {/* Vertical Center Spine / Anchor */}
        <path
          d="M 44 26 L 44 74"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Central Instant Settlement Lightning Node ⚡ */}
        <path
          d="M 52 20 L 37 49 L 49 49 L 43 78 L 67 43 L 53 43 Z"
          fill="#fef08a"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#blGlow)"
        />

        {/* Euro (€) and Birr (ብር) Subtle Micro-Emboss Dots */}
        <circle cx="28" cy="50" r="3" fill="#fde047" opacity="0.9" />
        <circle cx="70" cy="40" r="2.5" fill="#a7f3d0" opacity="0.9" />
        <circle cx="74" cy="65" r="2.5" fill="#a7f3d0" opacity="0.9" />
      </svg>
    </div>
  );
}

export default function BirrLinkLogo({
  size = 'md',
  variant = 'light', // 'light' (on dark nav) | 'dark' (on light page) | 'minimal'
  showTagline = true,
  showCorridor = true,
  asLink = true,
  className = '',
}) {
  const sizeMap = {
    sm: { icon: 30, text: 'text-lg', badge: 'text-[9px]', sub: 'text-[10px]' },
    md: { icon: 38, text: 'text-xl', badge: 'text-[10px]', sub: 'text-[11px]' },
    lg: { icon: 48, text: 'text-2xl', badge: 'text-[11px]', sub: 'text-xs' },
    xl: { icon: 60, text: 'text-3xl', badge: 'text-xs', sub: 'text-sm' },
  };

  const s = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Brand Icon Mark */}
      <BirrLinkIcon size={s.icon} />

      {/* Brand Wordmark & Descriptor */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight ${s.text} ${
              variant === 'dark' ? 'text-slate-900' : 'text-white'
            }`}
          >
            Birr
            <span className="bg-gradient-to-r from-amber-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent drop-shadow-sm">
              Link
            </span>
          </span>

          {showCorridor && (
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-mono font-black text-[9px] bg-amber-400 text-slate-950 uppercase tracking-wider shadow-sm transform group-hover:scale-105 transition-transform">
              <span>EUR</span>
              <span>⇄</span>
              <span>ETB</span>
            </span>
          )}
        </div>

        {showTagline && (
          <div className="flex items-center gap-1.5 mt-1 leading-none">
            <span
              className={`font-bold tracking-wider uppercase font-mono ${s.sub} ${
                variant === 'dark' ? 'text-emerald-700' : 'text-emerald-200/90'
              }`}
            >
              Direct Diaspora Remittance
            </span>
            <span className="w-1 h-1 rounded-full bg-amber-400"></span>
            <span className="text-[10px] text-emerald-300/80 hidden lg:inline">
              10-Min Payout
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" className="inline-block transition-opacity hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
}
