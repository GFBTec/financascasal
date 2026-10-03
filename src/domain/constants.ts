import type { Budgets, Category, CategoryId, Contribution, PaymentMethod, Person, PersonId } from './types';

export const CATEGORIES: Category[] = [
  { id: 'comida', name: 'Comida', color: 'oklch(0.66 0.13 60)' },
  { id: 'mercado', name: 'Mercado', color: 'oklch(0.58 0.11 145)' },
  { id: 'transporte', name: 'Transporte', color: 'oklch(0.56 0.11 260)' },
  { id: 'lazer', name: 'Lazer', color: 'oklch(0.58 0.14 340)' },
  { id: 'viagem', name: 'Viagem', color: 'oklch(0.60 0.09 195)' },
  { id: 'moradia', name: 'Moradia', color: 'oklch(0.42 0.04 60)' },
  { id: 'contas', name: 'Contas', color: 'oklch(0.70 0.12 90)' },
  { id: 'saude', name: 'Saúde', color: 'oklch(0.58 0.16 18)' },
  { id: 'presentes', name: 'Presentes', color: 'oklch(0.56 0.13 300)' },
  { id: 'pets', name: 'Pets', color: 'oklch(0.55 0.09 115)' },
  { id: 'outros', name: 'Outros', color: 'oklch(0.62 0.02 70)' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>;

export const PEOPLE: Record<PersonId, Person> = {
  enddy: { id: 'enddy', name: 'Enddy', color: 'oklch(0.60 0.15 38)', soft: 'oklch(0.60 0.15 38 / 0.13)' },
  bento: { id: 'bento', name: 'Bento', color: 'oklch(0.42 0.07 230)', soft: 'oklch(0.42 0.07 230 / 0.13)' },
  casal: { id: 'casal', name: 'Casal', color: 'oklch(0.55 0.10 160)', soft: 'oklch(0.55 0.10 160 / 0.14)' },
};

export const PERSON_IDS: PersonId[] = ['enddy', 'bento', 'casal'];

export const PAYMENT_METHODS: PaymentMethod[] = ['Crédito', 'Débito', 'Pix', 'Dinheiro', 'VR/VA'];

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

/** Cores de estado usadas fora do CSS (valores dinâmicos). Espelham src/styles/tokens.css. */
export const COLORS = {
  ink: '#1E1A15',
  muted: '#6E655A',
  card: '#FBF8F1',
  neutralDot: 'rgba(30,26,21,.3)',
  casalOnDark: 'oklch(0.78 0.10 160)',
  alert: 'oklch(0.58 0.19 27)',
  alertOnDark: 'oklch(0.65 0.18 28)',
  alertText: 'oklch(0.50 0.18 25)',
  warn: 'oklch(0.78 0.13 75)',
};
