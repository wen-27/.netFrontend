import { create } from "zustand";
import { tokenStorage } from "../../services/tokenStorage";
import { getRoleFromToken, getUserNameFromToken, isTokenExpired } from "../utils/jwt";
import { Role } from "../types/common";

type AuthState = {
  token: string | null;
  role: Role | null;
  userName: string;
  setSession: (token: string, role?: Role | string, email?: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
  refreshFromStorage: () => void;
};

function buildState(token: string | null) {
  const validToken = token && !isTokenExpired(token) ? token : null;
  if (!validToken) tokenStorage.clearToken();
  const storedRole = tokenStorage.getRole() as Role | null;
  const storedEmail = tokenStorage.getEmail();
  return {
    token: validToken,
    role: getRoleFromToken(validToken) ?? storedRole,
    userName: storedEmail ?? getUserNameFromToken(validToken),
  };
}

export const useAuth = create<AuthState>((set) => ({
  ...buildState(tokenStorage.getToken()),
  setSession: (token, role, email) => {
    tokenStorage.setToken(token);
    if (role) tokenStorage.setRole(String(role));
    if (email) tokenStorage.setEmail(email);
    set(buildState(token));
  },
  setToken: (token) => {
    tokenStorage.setToken(token);
    set(buildState(token));
  },
  logout: () => {
    tokenStorage.clearToken();
    set(buildState(null));
  },
  refreshFromStorage: () => set(buildState(tokenStorage.getToken())),
}));
