import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className = '', showDot = true }: StatusBadgeProps) {
  const s = status ? status.toUpperCase() : '';

  let bg = 'var(--pill-neutral-bg)';
  let color = 'var(--pill-neutral-ink)';
  let border = 'var(--pill-neutral-border)';
  let dotColor = '#94a3b8';

  if (s === 'ACTIVE' || s === 'PAID' || s === 'CONFIRMED' || s === 'COMPLETED') {
    bg = 'var(--pill-positive-bg)';
    color = 'var(--pill-positive-ink)';
    border = 'var(--pill-positive-border)';
    dotColor = '#10b981';
  } else if (s === 'OVERDUE' || s === 'CANCELLED' || s === 'FAILED') {
    bg = 'var(--pill-negative-bg)';
    color = 'var(--pill-negative-ink)';
    border = 'var(--pill-negative-border)';
    dotColor = '#ef4444';
  } else if (s === 'PAUSED' || s === 'QUOTATION' || s === 'PENDING') {
    bg = 'var(--pill-warning-bg)';
    color = 'var(--pill-warning-ink)';
    border = 'var(--pill-warning-border)';
    dotColor = '#f59e0b';
  } else if (s === 'ADMIN') {
    bg = '#eff6ff';
    color = '#1e40af';
    border = '#bfdbfe';
    dotColor = '#3b82f6';
  } else if (s === 'STAFF') {
    bg = '#f5f3ff';
    color = '#5b21b6';
    border = '#ddd6fe';
    dotColor = '#8b5cf6';
  } else if (s === 'CUSTOMER') {
    bg = '#f0fdf4';
    color = '#166534';
    border = '#bbf7d0';
    dotColor = '#22c55e';
  } else if (s === 'CLOSED') {
    bg = '#f1f5f9';
    color = '#64748b';
    border = '#cbd5e1';
    dotColor = '#94a3b8';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border shadow-subtle ${className}`}
      style={{ backgroundColor: bg, color, borderColor: border }}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
          style={{ backgroundColor: dotColor }}
        />
      )}
      <span>{status}</span>
    </span>
  );
}
