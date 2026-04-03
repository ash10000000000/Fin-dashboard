const { ISO_DATE_LENGTH } = require('./constants');

function toIsoDateString(date) {
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, ISO_DATE_LENGTH);
  }
  return null;
}

function padMonth(monthIndexZeroBased) {
  const m = monthIndexZeroBased + 1;
  return m < 10 ? `0${m}` : String(m);
}

function formatMonthLabel(year, monthIndexZeroBased) {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${monthNames[monthIndexZeroBased]} ${year}`;
}

function startOfUtcDay(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return d;
}

function addUtcDays(date, days) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function startOfIsoWeekUtc(date) {
  const d = startOfUtcDay(date);
  const day = d.getUTCDay();
  const diff = (day + 6) % 7;
  return addUtcDays(d, -diff);
}

module.exports = {
  toIsoDateString,
  padMonth,
  formatMonthLabel,
  startOfUtcDay,
  addUtcDays,
  startOfIsoWeekUtc,
};
