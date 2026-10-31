import React from 'react';

interface BrightloopLogoProps {
  className?: string;
  showText?: boolean;
  inverted?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function BrightloopLogo({
  className = '',
  showText = true,
  inverted = false,
  size = 'md',
}: BrightloopLogoProps) {
  const iconDimensions = {
    sm: 24,
    md: 28,
    lg: 36,
    xl: 44,
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
      {/* Official Brightloop icon.svg */}
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <rect
          width="32"
          height="32"
          rx="8"
          fill={inverted ? '#FFFFFF' : '#4F46E5'}
        />
        <path
          d="M16 16C12.5 11 6.5 11 6.5 16C6.5 21 12.5 21 16 16C19.5 11 25.5 11 25.5 16C25.5 21 19.5 21 16 16Z"
          stroke={inverted ? '#4F46E5' : '#FFFFFF'}
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <span
          className={`${textSizes[size]} ${
            inverted ? 'text-white' : 'text-slate-900'
          }`}
        >
          Brightloop
        </span>
      )}
    </div>
  );
}
