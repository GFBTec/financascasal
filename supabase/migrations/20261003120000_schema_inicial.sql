-- Gastos a Dois — schema inicial.
-- Idempotente: pode ser rodado de novo no SQL Editor sem erro.

-- ---------------------------------------------------------------------------
-- Membros: só os e-mails desta tabela conseguem ler e gravar dados.
-- Sem políticas de RLS => a tabela não é acessível pela API, só pelo painel/SQL.
-- ---------------------------------------------------------------------------
create table if not exists public.members (
  email text primary key
);
alter table public.members enable row level security;

create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.members m
    where lower(m.email) = lower(auth.jwt() ->> 'email')
  );
$$;

revoke execute on function public.is_member() from public, anon;
grant execute on function public.is_member() to authenticated;

-- ---------------------------------------------------------------------------
-- Gastos
-- ---------------------------------------------------------------------------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  amount numeric(12, 2) not null check (amount > 0),
  description text not null check (length(trim(description)) > 0),
  place text not null default '',
  who text not null check (who in ('enddy', 'bento', 'casal')),
  cat text not null,
  pay text not null,
  date date not null,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null
);
create index if not exists expenses_date_idx on public.expenses (date);

-- Orçamento mensal por categoria (vale para todos os meses)
create table if not exists public.budgets (
  cat text primary key,
  amount numeric(12, 2) not null default 0 check (amount >= 0)
);

-- Depósito na conta conjunta, vigente a partir de month_key ('AAAA-MM'; '0000-00' = padrão)
create table if not exists public.contributions (
  month_key text primary key check (month_key ~ '^\d{4}-\d{2}$'),
  enddy numeric(12, 2) not null default 0 check (enddy >= 0),
  bento numeric(12, 2) not null default 0 check (bento >= 0)
);

-- ---------------------------------------------------------------------------
-- RLS: membros têm acesso total; qualquer outro usuário não vê nada.
-- ---------------------------------------------------------------------------
alter table public.expenses enable row level security;
alter table public.budgets enable row level security;
alter table public.contributions enable row level security;

drop policy if exists "membros acessam gastos" on public.expenses;
create policy "membros acessam gastos" on public.expenses
  for all to authenticated
  using ((select public.is_member()))
  with check ((select public.is_member()));

drop policy if exists "membros acessam orcamentos" on public.budgets;
create policy "membros acessam orcamentos" on public.budgets
  for all to authenticated
  using ((select public.is_member()))
  with check ((select public.is_member()));

drop policy if exists "membros acessam depositos" on public.contributions;
create policy "membros acessam depositos" on public.contributions
  for all to authenticated
  using ((select public.is_member()))
  with check ((select public.is_member()));

-- ---------------------------------------------------------------------------
-- Realtime: um vê na hora o que o outro lançou.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['expenses', 'budgets', 'contributions'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
