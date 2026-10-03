export type PersonId = 'enddy' | 'bento' | 'casal';

export type CategoryId =
  | 'comida'
  | 'mercado'
  | 'transporte'
  | 'lazer'
  | 'viagem'
  | 'moradia'
  | 'contas'
  | 'saude'
  | 'presentes'
  | 'pets'
  | 'outros';

export type PaymentMethod = 'Crédito' | 'Débito' | 'Pix' | 'Dinheiro' | 'VR/VA';

export interface Expense {
  id: string;
  amount: number;
  desc: string;
  place: string;
  who: PersonId;
  cat: CategoryId;
  pay: PaymentMethod;
  /** AAAA-MM-DD */
  date: string;
}

/** Orçamento mensal por categoria — vale para todos os meses. */
export type Budgets = Record<CategoryId, number>;

/** Depósito mensal de cada pessoa na conta conjunta. */
export interface Contribution {
  enddy: number;
  bento: number;
}

/** Chave 'AAAA-MM' → depósito vigente a partir daquele mês. '0000-00' = padrão. */
export type Contributions = Record<string, Contribution>;

export interface Category {
  id: CategoryId;
  name: string;
  color: string;
}

export interface Person {
  id: PersonId;
  name: string;
  color: string;
  soft: string;
}

export type Screen = 'painel' | 'gastos' | 'orcamento';
