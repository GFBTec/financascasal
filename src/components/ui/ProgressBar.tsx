import type { CSSProperties } from 'react';

interface ProgressBarProps {
  /** 0–100 (valores acima são limitados a 100). */
  value: number;
  color: string;
  height?: number;
  track?: string;
}

export function ProgressBar({ value, color, height = 6, track }: ProgressBarProps) {
  const style = { '--progress-h': `${height}px`, '--progress-track': track } as CSSProperties;
  return (
    <div className="progress" style={style}>
      <span style={{ width: `${Math.max(0, Math.min(value, 100))}%`, background: color }} />
    </div>
  );
}
