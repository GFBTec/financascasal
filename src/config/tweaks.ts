/**
 * Ajustes de exibição (seção 6 da especificação).
 * Altere aqui para mudar o comportamento padrão do app.
 */
export interface Tweaks {
  /** Mostrar centavos nos valores. */
  showCents: boolean;
  /** 'pessoa' = barras diárias coloridas por pessoa; 'total' = uma cor só. */
  dailyMode: 'pessoa' | 'total';
  /** Tela inicial ao abrir o app. */
  startScreen: 'painel' | 'gastos';
}

export const TWEAKS: Tweaks = {
  showCents: true,
  dailyMode: 'pessoa',
  startScreen: 'painel',
};
