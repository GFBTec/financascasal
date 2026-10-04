import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { STATUSES, STATUS_IDS } from '../../domain/constants';
import type { ExpenseStatus } from '../../domain/types';

interface StatusSelectProps {
  value: ExpenseStatus;
  onChange: (status: ExpenseStatus) => void;
  label?: string;
}

interface MenuPosition {
  top: number;
  right: number;
  /** Abre para cima quando não há espaço abaixo do botão. */
  up: boolean;
}

const MENU_HEIGHT = 96;

function StatusPill({ status, chevron, open }: { status: ExpenseStatus; chevron?: boolean; open?: boolean }) {
  const s = STATUSES[status];
  return (
    <span className="status-pill" style={{ color: s.color, background: s.bg }}>
      <span className="status-pill__dot" style={{ background: s.color }} />
      {s.label}
      {chevron && <span className={open ? 'status-pill__chevron is-open' : 'status-pill__chevron'}>▾</span>}
    </span>
  );
}

/** Seletor PAGO / PENDENTE: pílula colorida que abre um menu com as opções também coloridas. */
export function StatusSelect({ value, onChange, label = 'Status do pagamento' }: StatusSelectProps) {
  const [pos, setPos] = useState<MenuPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const open = pos !== null;

  const close = (focusButton = false) => {
    setPos(null);
    if (focusButton) buttonRef.current?.focus();
  };

  const toggle = (e: MouseEvent) => {
    e.stopPropagation();
    if (open) return close();
    const r = buttonRef.current!.getBoundingClientRect();
    const up = r.bottom + MENU_HEIGHT + 12 > window.innerHeight;
    setPos({ top: up ? r.top - 6 : r.bottom + 6, right: window.innerWidth - r.right, up });
  };

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setPos(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close(true);
      }
    };
    const onViewportChange = () => setPos(null);

    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('scroll', onViewportChange, true);
    window.addEventListener('resize', onViewportChange);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('scroll', onViewportChange, true);
      window.removeEventListener('resize', onViewportChange);
    };
  }, [open]);

  const choose = (status: ExpenseStatus) => {
    if (status !== value) onChange(status);
    close(true);
  };

  const menuStyle: CSSProperties | undefined = pos
    ? { top: pos.top, right: pos.right, transform: pos.up ? 'translateY(-100%)' : undefined }
    : undefined;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="status-select"
        aria-label={`${label}: ${STATUSES[value].label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
      >
        <StatusPill status={value} chevron open={open} />
      </button>

      {pos &&
        createPortal(
          <div ref={menuRef} className="status-menu" role="listbox" aria-label={label} style={menuStyle}>
            {STATUS_IDS.map((id) => (
              <button
                key={id}
                type="button"
                role="option"
                aria-selected={id === value}
                aria-label={STATUSES[id].label}
                className="status-menu__option"
                onClick={() => choose(id)}
              >
                <StatusPill status={id} />
                <span className="status-menu__check">{id === value ? '✓' : ''}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
