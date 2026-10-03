/** 'oklch(0.66 0.13 60)' → 'oklch(0.66 0.13 60 / 0.14)' (versão "soft" para selos e chips). */
export const withAlpha = (color: string, alpha = 0.14) => color.replace(')', ` / ${alpha})`);
