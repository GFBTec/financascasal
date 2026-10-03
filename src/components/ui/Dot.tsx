import type { CSSProperties } from 'react';

interface DotProps {
  color: string;
  size?: number;
  square?: boolean;
}

export function Dot({ color, size = 8, square }: DotProps) {
  return (
    <span
      className={square ? 'dot dot--square' : 'dot'}
      style={{ background: color, '--dot-size': `${size}px` } as CSSProperties}
    />
  );
}
