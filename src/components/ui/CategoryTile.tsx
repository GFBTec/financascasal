import type { CSSProperties } from 'react';
import { CATEGORY_MAP } from '../../domain/constants';
import type { CategoryId } from '../../domain/types';

interface CategoryTileProps {
  cat: CategoryId;
  /** 36px (painel, orçamento) ou 40px (lista de gastos). */
  size?: 36 | 40;
}

/** Ícone da categoria num quadrado neutro de raio 12. */
export function CategoryTile({ cat, size = 36 }: CategoryTileProps) {
  const c = CATEGORY_MAP[cat] ?? CATEGORY_MAP.outros;
  const Icon = c.icon;
  return (
    <span className="cat-tile" style={{ '--tile-size': `${size}px` } as CSSProperties} title={c.name}>
      <Icon size={size >= 40 ? 19 : 18} strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
}
