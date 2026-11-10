export function formatDate(value, fallback = '—') {
  if (!value) return fallback;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString('es-CO');
  }
  return `${match[3]}/${match[2]}/${match[1]}`;
}
