import type { Screen } from '../../domain/types';

export const NAV_ITEMS: { id: Screen; label: string }[] = [
  { id: 'painel', label: 'Painel' },
  { id: 'gastos', label: 'Gastos' },
  { id: 'orcamento', label: 'Orçamento' },
];

export const SCREEN_TITLES: Record<Screen, string> = {
  painel: 'Painel',
  gastos: 'Gastos',
  orcamento: 'Orçamento',
};
