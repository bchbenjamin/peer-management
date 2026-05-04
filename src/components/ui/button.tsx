import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'pill' | 'outline-large';
  size?: 'lg' | 'md' | 'sm';
}

export function Button({ variant = 'primary', size = 'lg', className = '', ...props }: ButtonProps) {
  let baseStyles = 'inline-flex items-center justify-center gap-2 font-[var(--font-inter-variable)] font-[590] text-[var(--text-body)] leading-[var(--leading-body)] transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-neon-lime)] ';
  const sizeStyles = size === 'lg' ? 'px-[24px] py-[12px]' : size === 'md' ? 'px-[16px] py-[10px]' : 'px-[10px] py-[6px] text-[12px]';
  const pillSizeStyles = size === 'sm' ? 'px-[10px] py-[5px] text-[12px]' : 'px-[14px] py-[8px]';
  
  if (variant === 'primary') {
    baseStyles += `bg-[var(--color-neon-lime)] !text-[var(--color-pitch-black)] rounded-[var(--radius-buttons)] ${sizeStyles} shadow-[var(--shadow-subtle-3)] hover:bg-[color-mix(in_srgb,var(--color-neon-lime)_88%,white)]`;
  } else if (variant === 'ghost') {
    baseStyles += 'bg-transparent text-[var(--color-light-steel)] border-0 p-0 hover:text-[var(--color-porcelain)]';
  } else if (variant === 'pill') {
    baseStyles += `bg-[var(--color-gunmetal)] text-[var(--color-light-steel)] border border-[var(--color-charcoal-grey)] rounded-[var(--radius-pill)] ${pillSizeStyles} hover:text-[var(--color-porcelain)] hover:border-[var(--color-muted-ash)]`;
  } else if (variant === 'outline-large') {
    baseStyles += `bg-[var(--color-graphite)] text-[var(--color-porcelain)] border border-[var(--color-charcoal-grey)] rounded-[var(--radius-buttons)] ${sizeStyles} hover:bg-[var(--color-deep-slate)] hover:border-[var(--color-muted-ash)]`;
  }

  return (
    <button className={`${baseStyles} ${className}`} {...props}>
      {props.children}
    </button>
  );
}
