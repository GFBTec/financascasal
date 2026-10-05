import { ChevronLeft, ChevronRight } from 'lucide-react';
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
        <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
      </button>
      <div className="month-picker__label" aria-live="polite">
        {/* `key` reinicia a animação a cada troca de mês. */}
        <span key={monthKey} className="month-picker__text">
          {monthLabel(monthKey)}
        </span>
      </div>
      <button type="button" aria-label="Próximo mês" disabled={!canGoNext} onClick={onNext}>
        <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
