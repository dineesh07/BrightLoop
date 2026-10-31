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
      className={`p-4 sm:p-5 rounded-xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between overflow-hidden relative ${
        highlight ? 'border-l-4 border-l-blue-600 bg-gradient-to-br from-blue-50/20 to-white' : ''
      }`}
    >
      <div className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="mt-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums leading-tight truncate">
        {value}
      </div>
      {(subline || deltaText) && (
        <div className="mt-2 text-xs flex items-center gap-1.5 text-slate-500 truncate pt-2 border-t border-slate-100">
          {deltaText && (
            <span
              className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                isPositiveChange === true
                  ? 'bg-emerald-50 text-emerald-700'
                  : isPositiveChange === false
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
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
