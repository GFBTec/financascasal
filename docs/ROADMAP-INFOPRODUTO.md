# Roadmap — Gastos a Dois como infoproduto

Objetivo: transformar o app (hoje feito para um casal) em produto vendável, com planos
**mensal**, **anual** e **vitalício** via cartão de crédito.

Esforço: **P** = até 2h · **M** = meia noite de trabalho · **G** = uma noite ou mais.
Marque `[x]` ao concluir. Dependências entre parênteses.

---

## Fase 0 — Fundação (antes de mexer em dados reais)

- [ ] **T01 · CI no GitHub** (P) — GitHub Actions roda `typecheck`, `test` e `build` em todo push/PR.
  - Pronto quando: um PR com teste quebrado fica vermelho no GitHub.
- [ ] **T02 · Branch `dev` + previews** (P, T01) — trabalhar em `dev`, testar no link de preview da Vercel,
  proteger a `main` (só entra via PR com CI verde).
- [ ] **T03 · Ambiente de testes (staging)** (P) — segundo projeto Supabase para testar migrations sem
  arriscar os dados reais; previews da Vercel apontam para ele.
- [ ] **T04 · Migrations pelo Supabase CLI** (M, T03) — `supabase/migrations` aplicadas automaticamente;
  gerar tipos do banco (`supabase gen types`) para o TypeScript.
- [ ] **T05 · Backup semanal** (P) — GitHub Action com `pg_dump` guardando o arquivo como artefato privado.
- [ ] **T06 · Monitoramento de erros** (P) — Sentry (plano grátis) no front-end.

## Fase 1 — Vários casais (núcleo do produto)

- [ ] **T10 · Modelo multi-casal** (G, T03) — tabelas `households` e `household_members`; `household_id`
  em `expenses`, `budgets` e `contributions`; RLS por casal; migrar os dados atuais para o casal
  "Enddy & Bento". Substitui a tabela `members`.
  - Pronto quando: dois casais de teste não enxergam os dados um do outro.
- [ ] **T11 · Cadastro e recuperação de senha** (M, T10) — criar conta, confirmar e-mail, "esqueci a senha".
- [ ] **T12 · E-mail próprio (SMTP)** (P) — Resend ou similar no Supabase Auth (o e-mail padrão do
  Supabase envia pouquíssimas mensagens por hora).
- [ ] **T13 · Primeiros passos (onboarding)** (M, T10) — criar o casal: nomes das duas pessoas, cores,
  depósito inicial da conta conjunta.
- [ ] **T14 · Convite do parceiro** (M, T13) — link/código de convite; o parceiro cria conta e entra no casal.
- [ ] **T15 · Nomes dinâmicos** (M, T10) — remover "Enddy" e "Bento" fixos do código; tudo vem do casal.
- [ ] **T16 · Configurações da conta** (M, T15) — renomear pessoas, trocar cores, sair do casal,
  **excluir conta e dados** (LGPD).

## Fase 2 — Cobrança (mensal, anual, vitalício)

- [ ] **T20 · Decidir a plataforma** (P) — Kiwify/Hotmart (afiliados, mais rápido) ou Stripe (SaaS).
- [ ] **T21 · Tabela de assinaturas** (M, T10) — plano, status (`trial`, `ativa`, `atrasada`,
  `cancelada`, `vitalicia`), vencimento, IDs da plataforma.
- [ ] **T22 · Teste grátis de 7 dias** (P, T21) — começa automaticamente ao criar o casal.
- [ ] **T23 · Webhook de pagamento** (G, T20, T21) — Supabase Edge Function que valida a assinatura do
  aviso e trata: pagou, renovou, falhou, cancelou, reembolsou.
- [ ] **T24 · Bloqueio justo** (M, T21) — assinatura vencida = só leitura (vê tudo, não lança),
  nunca apaga dados. Tolerância de 3–7 dias para cartão recusado.
- [ ] **T25 · Tela de planos** (M, T23) — comparativo dos 3 planos, anual em destaque,
  botão "Gerenciar assinatura".
- [ ] **T26 · Vitalício em lotes** (P, T23) — limite de vagas configurável ("restam 47").
- [ ] **T27 · Reembolso em 7 dias** (P, T23) — direito de arrependimento (CDC art. 49) revoga o acesso.

## Fase 3 — Recursos que justificam o preço

- [ ] **T30 · Vencimento + status "Atrasado"** (P) — data de vencimento; atrasadas em destaque no topo.
- [ ] **T31 · Contas recorrentes** (M, T30) — aluguel, internet etc. gerados todo mês como PENDENTE.
- [ ] **T32 · Acerto de contas** (M) — "Fulano deve R$ X para Ciclano", botão "Acertar".
- [ ] **T33 · Parcelamento** (M) — "R$ 1.200 em 6x" cria as parcelas nos meses seguintes.
- [ ] **T34 · Receitas e saldo do mês** (M) — entradas × saídas × sobra.
- [ ] **T35 · Exportar CSV/Excel** (P).
- [ ] **T36 · Desfazer exclusão** (P) — aviso com botão "Desfazer" no lugar do segundo toque.

## Fase 4 — Cara de aplicativo

- [ ] **T40 · PWA instalável** (M) — manifest, ícones, tela de abertura, funciona offline.
- [ ] **T41 · Esqueletos de carregamento** (P).
- [ ] **T42 · Modo escuro** (M).
- [ ] **T43 · Dividir o pacote por tela** (P) — abrir mais rápido no 4G.

## Fase 5 — Lançamento

- [ ] **T50 · Termos de uso e política de privacidade (LGPD)** (P) — páginas no app e aceite no cadastro.
- [ ] **T51 · Página de vendas** (G) — prints, vídeo curto, planos, garantia de 7 dias, FAQ.
- [ ] **T52 · Domínio próprio** (P) — ex.: `gastosadois.com.br`.
- [ ] **T53 · E-mails automáticos** (M, T12) — boas-vindas, fim do teste, pagamento recusado.
- [ ] **T54 · Métricas de produto** (P) — funil cadastro → teste → pagamento (Plausible ou PostHog).
- [ ] **T55 · Beta com ~20 casais** (—) — preço de lançamento, coletar depoimentos.
- [ ] **T56 · Suporte** (P) — e-mail/WhatsApp e página de perguntas frequentes.
- [ ] **T57 · Formalização** (—) — CNPJ e emissão de nota fiscal; confirmar com contador o enquadramento.

---

## Plano para hoje à noite

1. **T01** CI no GitHub
2. **T02** Branch `dev` + previews
3. **T03** Ambiente de testes (staging) no Supabase
4. **T10** Modelo multi-casal (começar; é a maior tarefa)

**Decisão pendente:** T20 — Kiwify/Hotmart ou Stripe (define T21–T27).
