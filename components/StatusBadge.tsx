import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const s = status.toUpperCase();

  let bg = 'var(--pill-neutral-bg)';
  let color = 'var(--pill-neutral-ink)';

  if (s === 'ACTIVE' || s === 'PAID' || s === 'CONFIRMED' || s === 'COMPLETED') {
    bg = 'var(--pill-positive-bg)';
    color = 'var(--pill-positive-ink)';
  } else if (s === 'OVERDUE' || s === 'CANCELLED' || s === 'FAILED') {
    bg = 'var(--pill-negative-bg)';
    color = 'var(--pill-negative-ink)';
  } else if (s === 'PAUSED' || s === 'QUOTATION' || s === 'PENDING') {
    bg = 'var(--pill-warning-bg)';
    color = 'var(--pill-warning-ink)';
  } else if (s === 'DRAFT') {
    bg = 'var(--pill-neutral-bg)';
    color = 'var(--pill-neutral-ink)';
  } else if (s === 'CLOSED') {
    bg = '#e5e5e5';
    color = '#525252';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${className}`}
      style={{ backgroundColor: bg, color }}
    >
      {status}
    </span>
  );
}

