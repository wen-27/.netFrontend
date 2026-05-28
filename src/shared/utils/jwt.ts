import { Role, rolePriority } from "../types/common";

type JwtPayload = Record<string, unknown> & {
  exp?: number;
};

const roleClaimKeys = [
  "role",
  "roles",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
];

export function decodeJwt(token: string | null): JwtPayload | null {
  if (!token) return null;
  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string | null) {
  const payload = decodeJwt(token);
  if (!payload?.exp) return !token;
  return payload.exp * 1000 <= Date.now();
}

export function getRoleFromToken(token: string | null): Role | null {
  const payload = decodeJwt(token);
  if (!payload) return null;

  const roles = roleClaimKeys.flatMap((key) => {
    const value = payload[key];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return value.split(",").map((item) => item.trim());
    return [];
  });

  const normalizedRoles = roles.map((role) => {
    if (role === "Recepcionista") return "Receptionist";
    if (role === "Mecanico") return "Mechanic";
    if (role === "Mecánico") return "Mechanic";
    if (role === "Cliente") return "Client";
    if (role === "JefeTaller" || role === "Jefe de Taller") return "WorkshopChief";
    if (role === "JefeBodega" || role === "Jefe de Bodega") return "WarehouseChief";
    if (role === "JefeAlmacen" || role === "JefeAlmacén" || role === "Jefe de Almacén") return "InventoryManager";
    return role;
  });

  return rolePriority.find((role) => normalizedRoles.includes(role)) ?? null;
}

export function getUserNameFromToken(token: string | null) {
  const payload = decodeJwt(token);
  const value =
    payload?.name ??
    payload?.unique_name ??
    payload?.email ??
    payload?.sub ??
    "Usuario";
  return String(value);
}
