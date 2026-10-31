import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  subline?: string;
  isPositiveChange?: boolean;
  deltaText?: string;
  highlight?: boolean;
}

export function KpiCard({
  label,
  value,
  subline,
  isPositiveChange,
  deltaText,
  highlight = false,
}: KpiCardProps) {
  return (
    <div
      className={`p-3.5 sm:p-5 rounded-card bg-surface border border-border flex flex-col justify-between transition-colors overflow-hidden ${
        highlight ? 'border-l-4 border-l-chartHue' : ''
      }`}
    >
      <div className="text-[13px] font-medium text-muted tracking-tight">{label}</div>
      <div className="mt-2 text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-text tabular-nums leading-tight truncate">
        {value}
      </div>
      {(subline || deltaText) && (
        <div className="mt-2 text-xs flex items-center gap-1.5 text-muted truncate">
          {deltaText && (
            <span
              className={`font-medium ${
                isPositiveChange === true
                  ? 'text-positive'
                  : isPositiveChange === false
                  ? 'text-negative'
                  : 'text-muted'
              }`}
            >
              {deltaText}
            </span>
          )}
          {subline && <span className="truncate">{subline}</span>}
        </div>
      )}
    </div>
  );
}
