export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function isValidPhone(value) {
  return /^[0-9]{9,11}$/.test(String(value || "").replace(/\s|-/g, ""));
}

export function minLength(value, n) {
  return String(value || "").trim().length >= n;
}

export function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

export function passwordsMatch(a, b) {
  return a === b;
}
