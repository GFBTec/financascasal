import { PEOPLE, PERSON_IDS } from '../../domain/constants';
import { Dot } from './Dot';

export function PeopleLegend({ casalLabel = 'Casal' }: { casalLabel?: string }) {
  return (
    <div className="legend">
      {PERSON_IDS.map((id) => (
        <span key={id}>
          <Dot color={PEOPLE[id].color} square />
          {id === 'casal' ? casalLabel : PEOPLE[id].name}
        </span>
      ))}
    </div>
  );
}
