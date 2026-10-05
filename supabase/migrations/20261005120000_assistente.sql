-- v2: configurações do casal (dia de pagamento) e controle de uso do assistente com IA.
-- Idempotente: pode ser rodado de novo no SQL Editor sem erro.

-- ---------------------------------------------------------------------------
-- Configurações do casal (linha única por enquanto; vira por casal no multi-casal)
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  id smallint primary key default 1 check (id = 1),
  payday smallint not null default 5 check (payday between 1 and 28)
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

alter table public.settings enable row level security;

drop policy if exists "membros acessam configuracoes" on public.settings;
create policy "membros acessam configuracoes" on public.settings
  for all to authenticated
  using ((select public.is_member()))
  with check ((select public.is_member()));

do $$
begin
  alter publication supabase_realtime add table public.settings;
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Uso do assistente (limite de perguntas por minuto, aplicado na Edge Function)
-- ---------------------------------------------------------------------------
create table if not exists public.ai_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists ai_requests_user_time_idx on public.ai_requests (user_id, created_at desc);

alter table public.ai_requests enable row level security;

drop policy if exists "usuario registra e ve as proprias perguntas" on public.ai_requests;
create policy "usuario registra e ve as proprias perguntas" on public.ai_requests
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and (select public.is_member()));
