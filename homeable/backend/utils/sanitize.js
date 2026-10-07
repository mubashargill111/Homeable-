function cleanString(value, maxLength = 255) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, maxLength);
}

function optionalString(value, maxLength = 255) {
  const cleaned = cleanString(value, maxLength);
  return cleaned || null;
}

function normalizeEmail(value) {
  return cleanString(value, 150).toLowerCase();
}

function toPositiveInt(value, fallback = 1, max = 1000) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number) || number < 1) return fallback;
  return Math.min(number, max);
}

function toNonNegativeNumber(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return fallback;
  return number;
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

module.exports = {
  cleanString,
  optionalString,
  normalizeEmail,
  toPositiveInt,
  toNonNegativeNumber,
  isEmail
};
