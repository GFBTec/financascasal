import {
  Car,
  Check,
  Clock,
  Ellipsis,
  Gift,
  HeartPulse,
  House,
  PawPrint,
  Plane,
  Receipt,
  ShoppingCart,
  Ticket,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import type {
  Budgets,
  Category,
  CategoryId,
  Contribution,
  ExpenseStatus,
  PaymentMethod,
  Person,
  PersonId,
} from './types';

export const CATEGORIES: Category[] = [
  { id: 'comida', name: 'Comida', icon: Utensils },
  { id: 'mercado', name: 'Mercado', icon: ShoppingCart },
  { id: 'transporte', name: 'Transporte', icon: Car },
  { id: 'lazer', name: 'Lazer', icon: Ticket },
  { id: 'viagem', name: 'Viagem', icon: Plane },
  { id: 'moradia', name: 'Moradia', icon: House },
  { id: 'contas', name: 'Contas', icon: Receipt },
  { id: 'saude', name: 'Saúde', icon: HeartPulse },
  { id: 'presentes', name: 'Presentes', icon: Gift },
  { id: 'pets', name: 'Pets', icon: PawPrint },
  { id: 'outros', name: 'Outros', icon: Ellipsis },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>;

/** Cor de pessoa é exclusiva: laranja = Enddy, azul = Bento, verde = Casal. Não usar em mais nada. */
export const PEOPLE: Record<PersonId, Person> = {
  enddy: { id: 'enddy', name: 'Enddy', color: 'oklch(0.60 0.15 38)', soft: 'oklch(0.60 0.15 38 / 0.13)' },
  bento: { id: 'bento', name: 'Bento', color: 'oklch(0.42 0.07 230)', soft: 'oklch(0.42 0.07 230 / 0.13)' },
  casal: { id: 'casal', name: 'Casal', color: 'oklch(0.55 0.10 160)', soft: 'oklch(0.55 0.10 160 / 0.14)' },
};

export const PERSON_IDS: PersonId[] = ['enddy', 'bento', 'casal'];

export const PAYMENT_METHODS: PaymentMethod[] = ['Crédito', 'Débito', 'Pix', 'Dinheiro', 'VR/VA'];

export const DEFAULT_STATUS: ExpenseStatus = 'pago';

/** Rótulo, ícone e cores de cada status (tokens em src/styles/tokens.css). */
export const STATUSES: Record<
  ExpenseStatus,
  { label: string; icon: LucideIcon; color: string; text: string; soft: string }
> = {
  pago: { label: 'Pago', icon: Check, color: 'var(--pago)', text: 'var(--pago-text)', soft: 'var(--pago-soft)' },
  pendente: {
    label: 'Pendente',
    icon: Clock,
    color: 'var(--pendente)',
    text: 'var(--pendente-text)',
    soft: 'var(--pendente-soft)',
  },
};

export const STATUS_IDS: ExpenseStatus[] = ['pago', 'pendente'];

export const DEFAULT_BUDGETS: Budgets = {
  comida: 1200,
  mercado: 1500,
  transporte: 600,
  lazer: 500,
  viagem: 1000,
  moradia: 3500,
  contas: 450,
  saude: 300,
  presentes: 250,
  pets: 400,
  outros: 300,
};

export const DEFAULT_CONTRIBUTION_KEY = '0000-00';
export const DEFAULT_CONTRIBUTION: Contribution = { enddy: 2500, bento: 2000 };

/** Dia em que a conta do casal é abastecida (1–28). */
export const DEFAULT_PAYDAY = 5;

/** Cores usadas em estilos dinâmicos. Apontam para os tokens de src/styles/tokens.css. */
export const COLORS = {
  ink: 'var(--ink)',
  muted: 'var(--muted)',
  card: 'var(--card)',
  neutralDot: 'rgba(30,26,21,.3)',
  casalOnDark: 'oklch(0.78 0.10 160)',
  alertOnDark: 'oklch(0.65 0.18 28)',
  alertText: 'var(--pendente-text)',
};
