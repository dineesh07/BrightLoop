import React from 'react';
import Image from 'next/image';

interface BrightloopLogoProps {
  className?: string;
  showText?: boolean;
  inverted?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  useRaster?: boolean;
}

export function BrightloopLogo({
  className = '',
  showText = true,
  inverted = false,
  size = 'md',
  useRaster = true,
}: BrightloopLogoProps) {
  const heightMap = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-14',
  };

  const iconSizeMap = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 56,
  };

  const primaryColor = inverted ? '#ffffff' : '#5638F5';
  const sunColor = '#FF9800';

  if (useRaster && showText && !inverted) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <img
          src="/logo.png"
          alt="Brightloop"
          className={`${heightMap[size]} w-auto object-contain select-none`}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Radiant Infinity Loop Icon */}
      <svg
        width={iconSizeMap[size]}
        height={iconSizeMap[size]}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform group-hover:scale-105"
      >
        {/* 3 Radiant Sunburst Rays */}
        <g stroke={sunColor} strokeWidth="6.5" strokeLinecap="round">
          {/* Middle Ray */}
          <line x1="68" y1="28" x2="68" y2="16" />
          {/* Left Ray */}
          <line x1="56" y1="32" x2="47" y2="23" />
          {/* Right Ray */}
          <line x1="80" y1="32" x2="89" y2="23" />
        </g>

        {/* Infinity Loop Symbol */}
        <path
          d="M33 40C23 40 15 48 15 58C15 68 23 76 33 76C44 76 52 68 60 58C68 48 76 40 85 40C94 40 101 47 101 58C101 69 94 76 85 76C76 76 68 68 60 58C52 48 44 40 33 40Z"
          stroke={primaryColor}
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="scale(0.85) translate(4, 5)"
        />
      </svg>

      {showText && (
        <span
          className={`font-extrabold tracking-tight select-none transition-colors ${
            size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : size === 'xl' ? 'text-3xl' : 'text-xl'
          }`}
          style={{ color: primaryColor }}
        >
          Brightloop
        </span>
      )}
    </div>
  );
}

