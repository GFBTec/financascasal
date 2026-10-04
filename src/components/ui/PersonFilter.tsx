import { COLORS, PEOPLE } from '../../domain/constants';
import type { PersonId } from '../../domain/types';
import { Dot } from './Dot';

export type PersonFilterValue = PersonId | 'all';

const OPTIONS: { id: PersonFilterValue; label: string; dot: string }[] = [
  { id: 'all', label: 'Todos', dot: COLORS.neutralDot },
  { id: 'enddy', label: 'Enddy', dot: PEOPLE.enddy.color },
  { id: 'bento', label: 'Bento', dot: PEOPLE.bento.color },
  { id: 'casal', label: 'Casal', dot: PEOPLE.casal.color },
];

interface PersonFilterProps {
  value: PersonFilterValue;
  onChange: (value: PersonFilterValue) => void;
  small?: boolean;
}

/** Controle segmentado Todos · Enddy · Bento · Casal. */
export function PersonFilter({ value, onChange, small }: PersonFilterProps) {
  return (
    <div className={small ? 'segmented segmented--small' : 'segmented'} role="group" aria-label="Filtrar por pessoa">
      {OPTIONS.map((o) => (
        <button key={o.id} type="button" className="chip" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          <Dot color={o.dot} />
          {o.label}
        </button>
      ))}
    </div>
  );
}
