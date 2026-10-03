export const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];
export const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export const pad2 = (n: number) => String(n).padStart(2, '0');

/** Date → 'AAAA-MM' */
export const toMonthKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;

/** (ano, mês 0-11, dia) → 'AAAA-MM-DD' */
export const toISODate = (y: number, m0: number, d: number) => `${y}-${pad2(m0 + 1)}-${pad2(d)}`;

export const todayISO = () => {
  const n = new Date();
  return toISODate(n.getFullYear(), n.getMonth(), n.getDate());
};

export const currentMonthKey = () => toMonthKey(new Date());

/** 'AAAA-MM' → { year, month (1-12) } */
export const parseMonthKey = (key: string) => {
  const [year, month] = key.split('-').map(Number);
  return { year, month };
};

export const shiftMonth = (key: string, n: number) => {
  const { year, month } = parseMonthKey(key);
  return toMonthKey(new Date(year, month - 1 + n, 1));
};

export const daysInMonth = (key: string) => {
  const { year, month } = parseMonthKey(key);
  return new Date(year, month, 0).getDate();
};

export const monthName = (key: string) => MONTHS[parseMonthKey(key).month - 1];
export const monthShortName = (key: string) => MONTHS_SHORT[parseMonthKey(key).month - 1];
export const monthLabel = (key: string) => `${monthName(key)} ${parseMonthKey(key).year}`;

/** Meio-dia local evita deslocamento de fuso ao converter 'AAAA-MM-DD'. */
export const dateFromISO = (iso: string) => new Date(`${iso}T12:00:00`);
export const dayOfISO = (iso: string) => Number(iso.slice(8, 10));
export const monthKeyOfISO = (iso: string) => iso.slice(0, 7);

/** '2026-10-03' → '3 out' */
export const shortDayLabel = (iso: string) => {
  const d = dateFromISO(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};

/** '2026-10-03' → 'sáb, 3 de outubro' */
export const longDayLabel = (iso: string) => {
  const d = dateFromISO(iso);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
};
