'use client';

import React from 'react';

type CommentChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

export function CommentChip({ label, selected, onClick }: CommentChipProps) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-[var(--radius-tags)] border transition-colors ${
        selected 
          ? 'bg-[var(--color-neon-lime)] text-[var(--color-pitch-black)] border-[var(--color-neon-lime)]'
          : 'bg-[var(--color-gunmetal)] text-[var(--color-storm-cloud)] border-[var(--color-charcoal-grey)] hover:text-[var(--color-porcelain)]'
      }`}
    >
      {label}
    </button>
  );
}
