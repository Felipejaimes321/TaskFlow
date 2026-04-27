// ─── Date formatting utilities ────────────────────────────────────────────────

const MONTHS_LONG  = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MONTHS_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const DAYS_SHORT   = ['dom','lun','mar','mié','jue','vie','sáb'];

/**
 * Converts an ISO date string (YYYY-MM-DD) to a human-readable label.
 * Examples:
 *   today      → "Hoy"
 *   tomorrow   → "Mañana"
 *   this year  → "27 abr"
 *   other year → "27 abr 2027"
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date  = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.getTime() === today.getTime())    return 'Hoy';
  if (date.getTime() === tomorrow.getTime()) return 'Mañana';

  const dayName = DAYS_SHORT[date.getDay()];
  const dayNum  = date.getDate();
  const month   = MONTHS_SHORT[date.getMonth()];
  const yearStr = date.getFullYear() !== today.getFullYear() ? ` ${date.getFullYear()}` : '';

  return `${dayName}, ${dayNum} ${month}${yearStr}`;
}

/**
 * Shorter version: "27 abr"
 */
export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
}

/** Zero-pad a number */
export const pad = (n: number) => String(n).padStart(2, '0');

/** Returns YYYY-MM-DD for today + offset days */
export function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Returns YYYY-MM-DD from a Date object */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
