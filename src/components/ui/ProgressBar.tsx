import type { CSSProperties } from 'react';

interface ProgressBarProps {
  /** 0–100 (valores acima são limitados a 100). */
  value: number;
  /** Cor ou degradê de preenchimento (ex.: 'var(--grad-tech)'). */
  fill: string;
  /** Brilho ao redor do preenchimento (ex.: 'var(--glow-tech)'). */
  glow?: string;
  height?: number;
  track?: string;
}

export function ProgressBar({ value, fill, glow, height = 8, track }: ProgressBarProps) {
  const style = { '--progress-h': `${height}px`, '--progress-track': track } as CSSProperties;
  return (
    <div
      className="progress"
      style={style}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
    >
      <span style={{ width: `${Math.max(0, Math.min(value, 100))}%`, background: fill, boxShadow: glow }} />
    </div>
  );
}
