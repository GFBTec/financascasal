import { LayoutDashboard, List, Wallet, type LucideIcon } from 'lucide-react';
import type { Screen } from '../../domain/types';

export const NAV_ITEMS: { id: Screen; label: string; icon: LucideIcon }[] = [
  { id: 'painel', label: 'Painel', icon: LayoutDashboard },
  { id: 'gastos', label: 'Gastos', icon: List },
  { id: 'orcamento', label: 'Orçamento', icon: Wallet },
];

export const SCREEN_TITLES: Record<Screen, string> = {
  painel: 'Painel',
  gastos: 'Gastos',
  orcamento: 'Orçamento',
};
