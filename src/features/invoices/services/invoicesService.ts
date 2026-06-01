import { apiClient, getPaginated, getTotalCount, toSearchParams } from "../../../services/apiClient";
import { PaginatedResponse, QueryParams } from "../../../shared/types/common";
import { Invoice } from "../../../shared/types/domain";
import { getSessionCustomerName, isPlaceholderCustomerName } from "../../../shared/utils/sessionCustomer";

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

type ApiReceptionPayment = {
  id?: number | string;
  invoiceId?: number | string;
  serviceOrderId?: number | string;
  customer?: string | null;
  clientDocument?: string | null;
  vehicle?: string | null;
  amount?: number | string | null;
  total?: number | string | null;
  balance?: number | string | null;
  method?: string | null;
  status?: string | null;
  date?: string | null;
  reference?: string | null;
};

function toOrderCode(id?: number | string | null) {
  return id ? `OT-${new Date().getFullYear()}-${String(id).padStart(4, "0")}` : "Orden sin número";
}

function normalizeInvoice(invoice: ApiInvoice): Invoice {
  const customer = String(invoice.customer ?? "");
  return {
    id: String(invoice.id),
    number: String(invoice.number ?? invoice.invoiceNumber ?? `FV-${String(invoice.id).padStart(4, "0")}`),
    customer: isPlaceholderCustomerName(customer) ? getSessionCustomerName() : customer,
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

async function getMappedPayments(params: QueryParams): Promise<PaginatedResponse<Invoice>> {
  const response = await apiClient.get<ApiReceptionPayment[]>("/api/reception/payments", { params: toSearchParams(params) });
  const page = Math.max(1, Number(params.pageNumber ?? 1));
  const pageSize = Math.max(1, Number(params.pageSize ?? 10));
  const data = response.data.map((payment) => ({
    id: String(payment.id ?? ""),
    number: String(payment.reference ?? `PAGO-${payment.id ?? ""}`),
    customer: String(payment.customer ?? "Cliente"),
    orderCode: `OT-${payment.serviceOrderId ?? ""} / FV-${payment.invoiceId ?? ""}`,
    date: String(payment.date ?? ""),
    subtotal: Number(payment.amount ?? 0),
    taxes: Number(payment.balance ?? 0),
    total: Number(payment.total ?? 0),
    paymentStatus: String(payment.status ?? "PendingPayment"),
    amount: Number(payment.amount ?? 0),
    balance: Number(payment.balance ?? 0),
    method: String(payment.method ?? "Sin método"),
    vehicle: String(payment.vehicle ?? "Sin vehículo"),
    clientDocument: String(payment.clientDocument ?? ""),
    reference: String(payment.reference ?? ""),
  }));
  return {
    data: data.slice((page - 1) * pageSize, page * pageSize),
    totalCount: getTotalCount(response) || data.length,
  };
}

export const invoicesService = {
  list: (params: QueryParams) => getPaginated<Invoice>("/api/invoices", params),
  listClient: (params: QueryParams) => getMappedInvoices("/api/client/invoices", params),
  listReception: (params: QueryParams) => getMappedInvoices("/api/reception/invoices", params),
  getById: async (id: string) => {
    const response = await apiClient.get<ApiInvoice>(`/api/invoices/${id}`);
    return normalizeInvoice(response.data);
  },
  create: (payload: { serviceOrderId: number; invoiceStatusId: number }) => apiClient.post("/api/invoices", payload),
  listDetails: (params: QueryParams) => getPaginated("/api/invoicedetails", params, []),
  listPayments: (params: QueryParams) => getMappedPayments(params),
  registerPayment: (payload: { invoiceId: number; paymentMethodId: number; amount: number; cardLastFourDigits?: string | null; cardHolderName?: string | null; cardBrand?: string | null }) =>
    apiClient.post("/api/payments", payload),
  registerPaymentCard: (payload: { paymentId: number; cardTypeId: number; lastFourDigits: string; cardHolder: string; authorizationCode: string }) =>
    apiClient.post("/api/paymentcards", payload),
};
