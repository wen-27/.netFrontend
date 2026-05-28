import { apiClient, getPaginated } from "../../../services/apiClient";
import { QueryParams } from "../../../shared/types/common";
import { Invoice } from "../../../shared/types/domain";
import { mockInvoices } from "../../../shared/utils/mockData";

export const invoicesService = {
  list: (params: QueryParams) => getPaginated<Invoice>("/api/invoices", params, mockInvoices),
  listClient: (params: QueryParams) => getPaginated<Invoice>("/api/client/invoices", params, mockInvoices),
  listReception: (params: QueryParams) => getPaginated<Invoice>("/api/reception/invoices", params, mockInvoices),
  getById: (id: string) => apiClient.get(`/api/invoices/${id}`),
  create: (payload: { serviceOrderId: number; invoiceStatusId: number }) => apiClient.post("/api/invoices", payload),
  listDetails: (params: QueryParams) => getPaginated("/api/invoicedetails", params, []),
  listPayments: (params: QueryParams) => getPaginated<Invoice>("/api/payments", params, mockInvoices),
  registerPayment: (payload: { invoiceId: number; paymentMethodId: number; amount: number; cardLastFourDigits?: string | null; cardHolderName?: string | null; cardBrand?: string | null }) =>
    apiClient.post("/api/payments", payload),
  registerPaymentCard: (payload: { paymentId: number; cardTypeId: number; lastFourDigits: string; cardHolder: string; authorizationCode: string }) =>
    apiClient.post("/api/paymentcards", payload),
};
