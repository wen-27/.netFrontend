import { apiClient, getPaginated, getTotalCount, toSearchParams } from "../../../services/apiClient";
import { PaginatedResponse, QueryParams } from "../../../shared/types/common";
import { Invoice } from "../../../shared/types/domain";

type ApiInvoice = Partial<Invoice> & {
  id: number | string;
  serviceOrderId?: number | string;
  orderCode?: string | null;
  invoiceNumber?: string | null;
  customer?: string | null;
  invoiceDate?: string | null;
  date?: string | null;
  subtotal?: number | string | null;
  taxes?: number | string | null;
  total?: number | string | null;
  paymentStatus?: string | null;
};

function toOrderCode(id?: number | string | null) {
  return id ? `OT-${new Date().getFullYear()}-${String(id).padStart(4, "0")}` : "Orden sin número";
}

function normalizeInvoice(invoice: ApiInvoice): Invoice {
  return {
    id: String(invoice.id),
    number: String(invoice.number ?? invoice.invoiceNumber ?? `FV-${String(invoice.id).padStart(4, "0")}`),
    customer: String(invoice.customer ?? "Cliente"),
    orderCode: String(invoice.orderCode ?? toOrderCode(invoice.serviceOrderId)),
    date: String(invoice.date ?? invoice.invoiceDate ?? ""),
    subtotal: Number(invoice.subtotal ?? 0),
    taxes: Number(invoice.taxes ?? 0),
    total: Number(invoice.total ?? 0),
    paymentStatus: String(invoice.paymentStatus ?? "PendingPayment"),
  };
}

async function getMappedInvoices(endpoint: string, params: QueryParams): Promise<PaginatedResponse<Invoice>> {
  const response = await apiClient.get<ApiInvoice[]>(endpoint, { params: toSearchParams(params) });
  return {
    data: response.data.map(normalizeInvoice),
    totalCount: getTotalCount(response) || response.data.length,
  };
}

export const invoicesService = {
  list: (params: QueryParams) => getPaginated<Invoice>("/api/invoices", params),
  listClient: (params: QueryParams) => getMappedInvoices("/api/client/invoices", params),
  listReception: (params: QueryParams) => getMappedInvoices("/api/reception/invoices", params),
  getById: (id: string) => apiClient.get(`/api/invoices/${id}`),
  create: (payload: { serviceOrderId: number; invoiceStatusId: number }) => apiClient.post("/api/invoices", payload),
  listDetails: (params: QueryParams) => getPaginated("/api/invoicedetails", params, []),
  listPayments: (params: QueryParams) => getPaginated<Invoice>("/api/payments", params),
  registerPayment: (payload: { invoiceId: number; paymentMethodId: number; amount: number; cardLastFourDigits?: string | null; cardHolderName?: string | null; cardBrand?: string | null }) =>
    apiClient.post("/api/payments", payload),
  registerPaymentCard: (payload: { paymentId: number; cardTypeId: number; lastFourDigits: string; cardHolder: string; authorizationCode: string }) =>
    apiClient.post("/api/paymentcards", payload),
};
