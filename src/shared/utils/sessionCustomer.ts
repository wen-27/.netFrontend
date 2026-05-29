import { tokenStorage } from "../../services/tokenStorage";
import { decodeJwt } from "./jwt";

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function nameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "";
  const separated = localPart.replace(/[._-]+/g, " ").trim();

  if (separated.includes(" ")) {
    return titleCase(separated);
  }

  if (localPart.toLowerCase() === "wendyangelicavegasanchez") {
    return "Wendy Angelica Vega Sanchez";
  }

  return email;
}

export function getSessionCustomerName() {
  const token = tokenStorage.getToken();
  const payload = decodeJwt(token);
  const tokenName = payload?.name ?? payload?.unique_name;

  if (typeof tokenName === "string" && tokenName && !tokenName.includes("@")) {
    return tokenName;
  }

  const email = tokenStorage.getEmail() ?? (typeof payload?.email === "string" ? payload.email : undefined);
  return email ? nameFromEmail(email) : "Cliente";
}

export function isPlaceholderCustomerName(value?: string | null) {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return normalized === "cliente" || /^#?\d+\s*·?\s*cliente$/.test(normalized) || /^cliente\s+\d+$/.test(normalized);
}
