# Gastos a Dois — Especificação

App para Enddy & Bento registrarem gastos, controlarem mês a mês e acompanharem a conta conjunta.
Arquivo: `Gastos a Dois.dc.html` (abre direto no navegador; requer `support.js` na mesma pasta).
Dados salvos no `localStorage` do navegador (chave `enddy-bento-gastos-v1`).

---

## 1. Fundamentos visuais

### Cores
| Token | Valor | Uso |
|---|---|---|
| Fundo | `#F3EEE4` | Fundo da página |
| Cartão | `#FBF8F1` | Cartões, barra inferior, modais |
| Campo | `#FFFDF8` | Inputs |
| Tinta | `#1E1A15` | Texto principal, botões primários, cartão escuro (hero) |
| Texto secundário | `#6E655A` | Rótulos, metadados |
| Linha | `rgba(30,26,21,.10–.14)` | Bordas de cartões e inputs |
| Overlay | `rgba(30,26,21,.42)` | Fundo dos modais |
| Enddy | `oklch(0.60 0.15 38)` (terracota) | Pessoa; também hover do botão primário |
| Bento | `oklch(0.42 0.07 230)` (azul petróleo) | Pessoa |
| Casal | `oklch(0.55 0.10 160)` (verde) | Conta conjunta |
| Casal (sobre escuro) | `oklch(0.78 0.10 160)` | Barra da conta no hero |
| Alerta / excedido | `oklch(0.58 0.19 27)` · texto `oklch(0.50 0.18 25)` | Orçamento estourado, excluir |
| Atenção | `oklch(0.78 0.13 75)` | Uso > 85% |

Versão "soft" (fundo de selos/chips) = mesma cor com alpha 0.13–0.14.

### Cores das categorias
| Categoria | Cor |
|---|---|
| Comida | `oklch(0.66 0.13 60)` |
| Mercado | `oklch(0.58 0.11 145)` |
| Transporte | `oklch(0.56 0.11 260)` |
| Lazer | `oklch(0.58 0.14 340)` |
| Viagem | `oklch(0.60 0.09 195)` |
| Moradia | `oklch(0.42 0.04 60)` |
| Contas | `oklch(0.70 0.12 90)` |
| Saúde | `oklch(0.58 0.16 18)` |
| Presentes | `oklch(0.56 0.13 300)` |
| Pets | `oklch(0.55 0.09 115)` |
| Outros | `oklch(0.62 0.02 70)` |

### Tipografia (Google Fonts)
| Família | Uso | Tamanhos |
|---|---|---|
| **Instrument Serif** 400 (+ itálico) | Títulos, valores grandes | Título da tela `clamp(40px,5vw,56px)`; valor do hero `clamp(52px,8vw,92px)`; título de modal 30–32px; valor no modal 58px; valores em cartões 28–30px |
| **Montserrat** 400/500/600 | Texto de interface e descrições | Corpo 14–15px; metadados 12.5–13.5px; botões 13.5–15.5px |
| **Geist Mono** 400/500 | Rótulos em CAIXA ALTA, números pequenos | Rótulos 11–12px, `letter-spacing .08em`; valores em lista 13–14.5px; eixos de gráfico 10–10.5px |

### Forma e espaçamento
- Raio: cartões 20px · grupos de lista 16px · inputs/botões 10–12px · chips/pílulas 999px · modal 22px (mobile: só cantos superiores).
- Padding de cartão: 24px (hero `clamp(22px,3vw,32px)`). Gap entre cartões: 16px.
- Padding da área principal: `clamp(18px,3vw,40px)`; largura máx. 1240px.
- Barras de progresso: 6px (categorias) / 8px (hero) / 14px (quem gastou).
- Alvo de toque mínimo: 44–48px.

### Responsivo
- **Desktop (≥ 820px):** barra lateral fixa de 248px + conteúdo.
- **Mobile (< 820px):** barra de abas inferior fixa + botão flutuante "+" (60px, canto inferior direito, 88px do rodapé); modais abrem como bottom sheet.

---

## 2. Navegação

### Barra lateral (desktop)
- Marca "Enddy & Bento" (Instrument Serif 30px, "&" em itálico terracota) + "GASTOS A DOIS" (Geist Mono 11px).
- Itens: **Painel**, **Gastos** (mostra a contagem do mês), **Orçamento**. Ativo: fundo `rgba(30,26,21,.08)`.
- Botão primário **Novo gasto +** (fundo tinta, texto cartão, hover terracota).
- Legenda no rodapé: Enddy, Bento, Casal · conta conjunta.

### Abas inferiores (mobile)
- Painel · Gastos · Orçamento. Ativa: texto tinta + traço terracota de 18×3px acima.

### Cabeçalho (todas as telas)
- Título da tela (Instrument Serif).
- **Seletor de mês**: pílula com ‹ mês ano ›. Botões de 36px. "›" desativado (opacidade 0.25) no mês atual.

---

## 3. Telas

### 3.1 Painel
1. **Conta do casal (cartão escuro)**
   - Rótulo "CONTA DO CASAL · {mês}" + botão **Editar valor** (pílula com contorno claro) → abre o modal Conta do casal.
   - Valor depositado no mês (padrão R$ 4.500 = Enddy R$ 2.500 + Bento R$ 2.000).
   - Barra: usado ÷ depositado (verde; vermelho se ultrapassar).
   - "Usado R$ X (Y%)" · "Sobra R$ Z" ou "Passou R$ Z".
   - Considera apenas gastos com quem = **Casal**.
2. **Quem gastou**
   - Barra segmentada Enddy / Bento / Casal (proporcional).
   - Linhas: nome, nº de gastos, %, valor.
   - Rodapé: "{Pessoa} gastou R$ X a mais que {outra}" (compara só Enddy × Bento).
3. **Evolução diária**
   - Barras empilhadas por dia (Bento, Casal, Enddy), altura 190px.
   - Dias acima de 2,2× o 2º maior são cortados com selo "↑ R$ X".
   - Dias futuros com hachura; dia de hoje destacado em terracota no eixo.
   - Hover/toque: "{dia} de {mês} · Enddy R$ · Bento R$ · Casal R$"; sem hover: média diária.
   - Legenda: Enddy, Bento, Casal.
4. **Por categoria**
   - Linha por categoria (ordenada pelo gasto): cor, nome, gasto, "de R$ orçado" ou "+R$ excedido", barra de progresso.
   - Categorias sem gasto aparecem com opacidade 0.55.
   - Link **Editar orçamento** → tela Orçamento.
5. **Últimos 6 meses**
   - Legenda: Enddy · Bento · Casal (conta conjunta). Subtítulo explicativo.
   - Barra por mês empilhada pelas 3 cores; valor total acima; mês abaixo.
   - Mês selecionado com opacidade 1 e negrito; demais 0.5.
   - Clicar numa barra muda o mês exibido. Hover mostra o detalhe por pessoa.
6. **Maiores gastos**
   - Top 5 do mês: posição (serif itálico), descrição, pessoa · data · categoria, valor. Clicar → editar.

### 3.2 Gastos
- **Filtro de pessoa** (segmentado): Todos · Enddy · Bento · Casal.
- **Busca** por descrição ou local.
- **Filtro de categoria**: chips com rolagem horizontal (Todas + 11).
- Resumo: "N gastos em {mês}" + total filtrado.
- Lista agrupada por dia (ex.: "SEX, 3 DE OUTUBRO" + total do dia). Item: ícone com a inicial da categoria, descrição, "categoria · local · pagamento", valor, selo da pessoa. Clicar → editar.
- Estado vazio: "Nada por aqui." + botão **Adicionar gasto**.

### 3.3 Orçamento
- Cartão escuro com o orçamento mensal total (soma das categorias).
- Linha por categoria: gasto do mês (ou "passou R$ X" em vermelho) + campo numérico "R$". Salva automaticamente.
- Padrões: Comida 1.200 · Mercado 1.500 · Transporte 600 · Lazer 500 · Viagem 1.000 · Moradia 3.500 · Contas 450 · Saúde 300 · Presentes 250 · Pets 400 · Outros 300.
- Ações: **Restaurar exemplo** · **Apagar todos os gastos** (pede um 2º toque para confirmar em até 3s).

---

## 4. Modais

### 4.1 Novo gasto / Editar gasto
Desktop: centralizado, largura máx. 540px. Mobile: bottom sheet. Fecha com ×, clique fora ou Esc.

| Campo | Controle | Regras |
|---|---|---|
| Valor | Input grande "R$" (Instrument Serif 58px) | Aceita `1.234,56` ou `1234.56`; precisa ser > 0 |
| Quem gastou | 3 botões: Enddy · Bento · Casal | Padrão = pessoa do último gasto |
| O quê | Texto | Obrigatório |
| Local | Texto | Opcional |
| Categoria | 11 chips | Padrão Comida |
| Quando | Data | Padrão hoje (ou 1º dia do mês exibido) |
| Pagamento | Crédito · Débito · Pix · Dinheiro · VR/VA | Padrão Crédito |

- **Salvar gasto** (primário): valida, salva, leva ao mês do gasto, mostra o aviso "Gasto salvo".
- **Excluir** (somente ao editar): 1º toque → "Confirmar exclusão"; 2º toque exclui.
- Mensagens de erro em vermelho acima dos botões.

### 4.2 Conta do casal
- Campos numéricos: depósito de Enddy e de Bento; total ao vivo.
- **Salvar valor**: vale a partir do mês exibido; os meses anteriores mantêm o valor antigo.

### 4.3 Aviso (toast)
- Pílula escura na parte de baixo, some em 2,2s ("Gasto salvo", "Gasto atualizado", "Gasto excluído", "Valor da conta atualizado"…).

---

## 5. Dados

```js
gasto = { id, amount, desc, place, who: 'enddy'|'bento'|'casal', cat, pay, date: 'AAAA-MM-DD' }
budgets = { [categoria]: valor }               // mensal, vale para todos os meses
contribs = { 'AAAA-MM': { enddy, bento } }     // a partir daquele mês; '0000-00' = padrão
```
- Comparação mensal: no mês atual, compara com o mesmo período do mês anterior.
- Moeda: BRL (`pt-BR`).

## 6. Ajustes (Tweaks)
| Prop | Opções | Padrão |
|---|---|---|
| `showCents` | sim/não | sim |
| `dailyMode` | `pessoa` (cores por pessoa) / `total` (uma cor) | `pessoa` |
| `startScreen` | `painel` / `gastos` | `painel` |
