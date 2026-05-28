import { PaymentStatus } from "../types/domain";

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PendingPayment: "Pendiente de pago",
  PendingReceptionVerification: "Pendiente de revisión",
  Approved: "Pagada",
  Rejected: "Rechazada",
  Refunded: "Reembolsada",
};

export const paymentStatusBadgeTone: Record<PaymentStatus, "amber" | "blue" | "green" | "red" | "slate"> = {
  PendingPayment: "amber",
  PendingReceptionVerification: "blue",
  Approved: "green",
  Rejected: "red",
  Refunded: "slate",
};

export function getPaymentStatusLabel(status?: string | null) {
  if (!status) return "Pendiente de pago";
  return paymentStatusLabels[status as PaymentStatus] ?? status;
}

export function getPaymentStatusTone(status?: string | null) {
  if (!status) return "amber";
  return paymentStatusBadgeTone[status as PaymentStatus] ?? "slate";
}
