import { createContext, useState } from "react";
import { readSession, writeSession, clearSession, loginUser, registerUser } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const initial = readSession();
  const [user, setUser] = useState(initial.user);
  const [role, setRole] = useState(initial.role);
  const booting = false; // đọc session đồng bộ từ localStorage, không cần trạng thái chờ

  function persist(nextUser, nextRole) {
    setUser(nextUser);
    setRole(nextRole);
    writeSession(nextUser, nextRole);
  }

  async function login({ email, password, role: asRole }) {
    const res = await loginUser({ email, password, role: asRole });
    if (!res.ok) return res;
    persist(res.user, asRole);
    return { ok: true };
  }

  async function register(payload) {
    const res = await registerUser(payload);
    if (!res.ok) return res;
    persist(res.user, payload.role);
    return { ok: true };
  }

  function logout() {
    setUser(null);
    setRole(null);
    clearSession();
  }

  function updateProfile(patch) {
    persist({ ...user, ...patch }, role);
  }

  return (
    <AuthContext.Provider value={{ user, role, booting, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
