function padDatePart(value: number) {
  return value.toString().padStart(2, '0');
}

function isDateOnlyString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function toLocalDateString(value: Date | string) {
  if (typeof value === 'string' && isDateOnlyString(value)) {
    return value;
  }

  const date = typeof value === 'string' ? new Date(value) : value;
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

export function today() {
  return toLocalDateString(new Date());
}

export function shiftLocalDate(dateStr: string, days: number) {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalDateString(date);
}

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T12:00:00`);
  return `${DAYS_PT[date.getDay()]}, ${date.getDate()} ${MONTHS_PT[date.getMonth()]}`;
}

export function isPast(value: string | null) {
  if (!value) {
    return false;
  }

  return value < today();
}
