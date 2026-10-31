import React from 'react';

interface BrightloopLogoProps {
  className?: string;
  showText?: boolean;
  inverted?: boolean;
  variant?: 'mark' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function BrightloopLogo({
  className = '',
  showText = true,
  inverted = false,
  variant = 'mark',
  size = 'md',
}: BrightloopLogoProps) {
  const iconDimensions = {
    sm: { w: 32, h: 24 },
    md: { w: 40, h: 30 },
    lg: { w: 48, h: 36 },
    xl: { w: 60, h: 45 },
  };

  const textSizes = {
    sm: 'text-sm font-bold tracking-tight',
    md: 'text-base font-bold tracking-tight',
    lg: 'text-xl font-bold tracking-tight',
    xl: 'text-2xl font-bold tracking-tight',
  };

  const dim = iconDimensions[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {variant === 'badge' ? (
        <div className="shrink-0 p-1.5 rounded-xl bg-indigo-600 flex items-center justify-center shadow-subtle">
          <svg
            width={dim.w * 0.75}
            height={dim.h * 0.75}
            viewBox="0 0 40 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
            aria-hidden="true"
          >
            {/* 3 Golden Sunburst Rays */}
            <line x1="20" y1="2" x2="20" y2="7.5" stroke="#FFA726" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="14" y1="3.5" x2="16.5" y2="8" stroke="#FFA726" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="26" y1="3.5" x2="23.5" y2="8" stroke="#FFA726" strokeWidth="2.5" strokeLinecap="round" />
            {/* White Infinity Loop */}
            <path
              d="M20 20 C16 14.5, 7 14.5, 7 20 C7 25.5, 16 25.5, 20 20 C24 14.5, 33 14.5, 33 20 C33 25.5, 24 25.5, 20 20 Z"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : (
        <svg
          width={dim.w}
          height={dim.h}
          viewBox="0 0 40 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
          aria-hidden="true"
        >
          {/* 3 Golden Sunburst Rays */}
          <line x1="20" y1="2" x2="20" y2="7.5" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="14" y1="3.5" x2="16.5" y2="8" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="26" y1="3.5" x2="23.5" y2="8" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          {/* Official Indigo Infinity Loop */}
          <path
            d="M20 20 C16 14.5, 7 14.5, 7 20 C7 25.5, 16 25.5, 20 20 C24 14.5, 33 14.5, 33 20 C33 25.5, 24 25.5, 20 20 Z"
            stroke={inverted ? '#FFFFFF' : '#4F46E5'}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {showText && (
        <span
          className={`${textSizes[size]} ${
            inverted ? 'text-white' : 'text-indigo-950 font-extrabold'
          }`}
        >
          Brightloop
        </span>
      )}
    </div>
  );
}
