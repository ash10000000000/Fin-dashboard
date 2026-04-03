export function formatCurrency(value) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
}

export function formatSignedCurrencyForTable(value, type) {
  const abs = formatCurrency(value);
  if (type === 'expense') {
    return `−${abs}`;
  }
  return `+${abs}`;
}
