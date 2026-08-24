import api, { RESOURCES } from "./api";
import { ROLES } from "../constants/roles";

export const SESSION_KEY = "morent_session";

// Tài khoản Admin không lưu trong DB (vai trò quản trị hệ thống, cấu hình cứng)
export const ADMIN_ACCOUNT = { email: "admin@morent.vn", password: "admin123", name: "Quản trị viên" };

export function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : { user: null, role: null };
  } catch {
    return { user: null, role: null };
  }
}

export function writeSession(user, role) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user, role }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function resourceForRole(role) {
  return role === ROLES.PROVIDER ? RESOURCES.PROVIDERS : RESOURCES.CUSTOMERS;
}

export async function loginUser({ email, password, role }) {
  if (role === ROLES.ADMIN) {
    if (email === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
      return { ok: true, user: { id: "admin", name: ADMIN_ACCOUNT.name, email } };
    }
    return { ok: false, message: "Sai email hoặc mật khẩu quản trị viên" };
  }

  const list = await api.list(resourceForRole(role));
  const found = list.find((u) => u.email === email && u.password === password);
  if (!found) return { ok: false, message: "Sai email hoặc mật khẩu" };
  if (found.status === "suspended") return { ok: false, message: "Tài khoản đã bị khoá" };
  return { ok: true, user: found };
}

export async function registerUser({ role, ...payload }) {
  const resource = resourceForRole(role);
  const list = await api.list(resource);
  if (list.some((u) => u.email === payload.email)) {
    return { ok: false, message: "Email này đã được đăng ký" };
  }
  const created = await api.create(resource, { ...payload, status: "active" });
  return { ok: true, user: created };
}
