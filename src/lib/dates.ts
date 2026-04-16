export function today() {
  return new Date().toISOString().slice(0, 10);
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
