import React from 'react';

export function Card({ dark = false, className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement> & { dark?: boolean }) {
  if (dark) {
    return (
      <div className={`bg-[var(--color-deep-slate)] text-[var(--color-porcelain)] rounded-[var(--radius-xl)] shadow-[var(--shadow-subtle)] ${className}`} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div className={`bg-[var(--color-graphite)] rounded-[var(--radius-cards)] shadow-[var(--shadow-sm)] border border-[var(--color-charcoal-grey)] ${className}`} {...props}>
      {children}
    </div>
  );
}
