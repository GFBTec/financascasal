# Gastos a Dois

App para Enddy & Bento registrarem gastos, controlarem mês a mês e acompanharem a conta conjunta.
Especificação completa em [docs/ESPECIFICACAO.md](docs/ESPECIFICACAO.md); o protótipo original está em [docs/prototipo/](docs/prototipo/).

**Stack:** Vite + React 19 + TypeScript · Supabase (Postgres, Auth, Realtime) · Vitest para testes.

## Supabase

1. Rode [supabase/migrations/20261003120000_schema_inicial.sql](supabase/migrations/20261003120000_schema_inicial.sql)
   no **SQL Editor** (ou deixe a integração GitHub do Supabase aplicar a migration).
2. Libere os e-mails do casal: `insert into public.members (email) values ('a@x.com'), ('b@x.com');`
3. Crie os dois usuários em **Authentication → Users → Add user** (marque *Auto Confirm User*) e,
   em **Authentication → Sign In / Providers**, desative *Allow new users to sign up*.
4. Copie `.env.example` para `.env.local` e preencha URL e publishable key (as mesmas variáveis vão
   em **Vercel → Settings → Environment Variables**).

Segurança: todas as tabelas usam RLS; só e-mails em `members` leem ou gravam dados.

### Assistente do mês (v2)

1. Rode [supabase/migrations/20261005120000_assistente.sql](supabase/migrations/20261005120000_assistente.sql)
   no SQL Editor (cria `settings` com o dia de pagamento e `ai_requests` para o limite de perguntas).
2. Publique a Edge Function [supabase/functions/assistente](supabase/functions/assistente/index.ts)
   (CLI: `supabase functions deploy assistente`, ou pelo painel em **Edge Functions → Deploy a new function**).
3. Cadastre a chave da Anthropic **só no servidor**: **Edge Functions → Secrets → `ANTHROPIC_API_KEY`**.
   Nunca coloque essa chave no front ou na Vercel.

As dicas automáticas e o cálculo "pode gastar por dia" funcionam sem a função; só o campo de pergunta depende dela.

## Comandos

```bash
npm install        # instalar dependências
npm run dev        # servidor de desenvolvimento (http://localhost:5173)
npm test           # testes unitários
npm run typecheck  # checagem de tipos
npm run build      # build de produção em dist/
```

## Estrutura

```
src/
├── main.tsx                 # ponto de entrada (estilos globais + provider)
├── App.tsx                  # shell: navegação, mês selecionado, modais, toast
├── config/tweaks.ts         # ajustes de exibição (centavos, modo do gráfico, tela inicial)
├── domain/                  # regras de negócio, sem React
│   ├── types.ts             # Expense, Budgets, Contributions...
│   ├── constants.ts         # categorias, pessoas, cores, padrões
│   └── calculations.ts      # totais, séries diárias, filtros, agrupamentos (+ testes)
├── data/
│   ├── repository.ts        # leitura/gravação no Supabase + Realtime
│   └── seed.ts              # 6 meses de dados de exemplo
├── state/
│   ├── AuthContext.tsx      # sessão, login e verificação de membro
│   └── GastosContext.tsx    # estado compartilhado (otimista, sincroniza com o Supabase)
├── screens/login/           # tela de login (e-mail + senha)
├── hooks/                   # useToast, useConfirm (ação em dois toques)
├── lib/                     # datas, formatação BRL, parse de valores, cores
├── styles/                  # tokens.css (design tokens) + global.css (componentes base)
├── components/
│   ├── layout/              # Sidebar, TabBar + FAB, MonthPicker, Brand
│   └── ui/                  # Card, Chip, Dot, Modal, MoneyField, ProgressBar, Toast...
├── screens/
│   ├── painel/              # Conta do casal, Quem gastou, Evolução diária, Por categoria,
│   │                        # Últimos 6 meses, Maiores gastos
│   ├── gastos/              # lista com filtros, busca e agrupamento por dia
│   └── orcamento/           # orçamento por categoria, restaurar/apagar dados
└── modals/                  # Novo/Editar gasto, Conta do casal
```

## Responsivo

- **Desktop (≥ 820px):** barra lateral fixa + conteúdo.
- **Mobile (< 820px):** abas inferiores, botão flutuante "+" e modais como bottom sheet — tudo via media queries em CSS.
