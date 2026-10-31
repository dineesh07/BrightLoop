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
      className={`p-4 sm:p-5 rounded-2xl bg-white border border-border shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between overflow-hidden relative ${highlight ? 'border-l-4 border-l-brand bg-gradient-to-br from-brand-light/25 to-white' : ''
        }`}
    >
      <div className="text-[11px] font-semibold text-muted uppercase tracking-wider">{label}</div>
      <div
        className="mt-2 text-xl xl:text-2xl font-bold tracking-tight text-text tabular-nums leading-tight whitespace-nowrap"
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </div>
      {(subline || deltaText) && (
        <div className="mt-2 text-xs flex items-center gap-1.5 text-muted truncate pt-2 border-t border-rule">
          {deltaText && (
            <span
              className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${isPositiveChange === true
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isPositiveChange === false
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-raised text-text border border-border'
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
