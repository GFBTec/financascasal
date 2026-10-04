-- Status de pagamento de cada gasto (PAGO / PENDENTE).
-- Gastos já existentes ficam como 'pago'.
alter table public.expenses
  add column if not exists status text not null default 'pago'
  check (status in ('pago', 'pendente'));
