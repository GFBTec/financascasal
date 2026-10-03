import type { CSSProperties, ReactNode } from 'react';

interface CardProps {
  dark?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function Card({ dark, className = '', style, children }: CardProps) {
  return (
    <section className={`card ${dark ? 'card--dark' : ''} ${className}`} style={style}>
      {children}
    </section>
  );
}
