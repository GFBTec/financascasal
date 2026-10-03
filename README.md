# Gastos a Dois

App para Enddy & Bento registrarem gastos, controlarem mês a mês e acompanharem a conta conjunta.
Especificação completa em [docs/ESPECIFICACAO.md](docs/ESPECIFICACAO.md); o protótipo original está em [docs/prototipo/](docs/prototipo/).

**Stack:** Vite + React 19 + TypeScript · Vitest para testes · dados no `localStorage` (chave `enddy-bento-gastos-v1`, compatível com o protótipo).

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
│   ├── storage.ts           # leitura/gravação no localStorage (+ migração v1)
│   └── seed.ts              # 6 meses de dados de exemplo
├── state/GastosContext.tsx  # estado global (gastos, orçamento, conta do casal) + ações
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
