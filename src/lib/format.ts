export function formatUSD(value: number, opts?: { sign?: boolean }): string {
  const abs = Math.abs(value);
  const str = `U$S ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(abs)}`;
  if (!opts?.sign) return value < 0 ? `-${str}` : str;
  if (value > 0) return `+${str}`;
  if (value < 0) return `-${str}`;
  return str;
}

export function formatAmount(
  value: number,
  currency: 'ARS' | 'USD' = 'ARS',
  opts?: { sign?: boolean },
): string {
  return currency === 'USD' ? formatUSD(value, opts) : formatCurrency(value, opts);
}

export function formatCurrency(value: number, opts?: { sign?: boolean }): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(abs);
  if (!opts?.sign) return value < 0 ? `-${formatted}` : formatted;
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDateLong(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  const raw = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
  // Normalize to sentence case — some browsers capitalize every word via Intl
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

export function formatDateShort(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
  }).format(d);
}

export function formatWeekday(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(d);
}
