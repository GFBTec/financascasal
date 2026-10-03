import { monthLabel } from '../../lib/date';

interface MonthPickerProps {
  monthKey: string;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthPicker({ monthKey, canGoNext, onPrev, onNext }: MonthPickerProps) {
  return (
    <div className="month-picker">
      <button type="button" aria-label="Mês anterior" onClick={onPrev}>
        ‹
      </button>
      <div className="month-picker__label">{monthLabel(monthKey)}</div>
      <button type="button" aria-label="Próximo mês" disabled={!canGoNext} onClick={onNext}>
        ›
      </button>
    </div>
  );
}
