import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "Sin fecha";
  return format(new Date(value), "dd MMM yyyy", { locale: es });
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return "Sin fecha";
  return format(new Date(value), "dd MMM yyyy, HH:mm", { locale: es });
}
