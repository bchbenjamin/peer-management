import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  dark?: boolean;
  inputSize?: 'md' | 'sm';
}

export function Input({ dark = false, inputSize = 'md', className = '', ...props }: InputProps) {
  const baseStyles = 'font-[var(--font-inter-variable)] w-full rounded-[var(--radius-inputs)] outline-none transition-colors text-[var(--text-body)] leading-[var(--leading-body)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-neon-lime)_45%,transparent)]';
  const sizeStyles = inputSize === 'sm' ? 'px-3 py-2' : 'px-[14px] py-[12px]';
  const spacingStyles = dark ? sizeStyles : sizeStyles;
  const colorStyles = dark
    ? 'bg-[var(--color-gunmetal)] text-[var(--color-porcelain)] placeholder:text-[var(--color-storm-cloud)] border border-[var(--color-charcoal-grey)]'
    : 'bg-[var(--color-graphite)] text-[var(--color-porcelain)] border border-[var(--color-charcoal-grey)] placeholder:text-[var(--color-storm-cloud)]';

  return (
    <input className={`${baseStyles} ${spacingStyles} ${colorStyles} ${className}`} {...props} />
  );
}
