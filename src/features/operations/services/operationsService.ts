import { apiClient } from "../../../services/apiClient";
import {
  AdditionalRequest,
  ClientPayment,
  ClientPaymentRequest,
  MechanicDiagnostic,
  PaymentStatus,
  OrderServiceItem,
  ServiceOrder,
  StockDashboard,
  StockMovement,
  StockSubmission,
  WarehouseProduct,
  WorkshopService,
  WorkshopServicePart,
} from "../../../shared/types/domain";
import { getSessionCustomerName, isPlaceholderCustomerName } from "../../../shared/utils/sessionCustomer";

async function apiData<T>(request: Promise<{ data: T }>): Promise<T> {
  const response = await request;
  return response.data;
}

type ApiClientOrder = Partial<ServiceOrder> & {
  id: number | string;
  orderStatusId?: number | string | null;
  OrderStatusId?: number | string | null;
  statusId?: number | string | null;
  StatusId?: number | string | null;
  orderStatus?: string | { name?: string | null; id?: number | string | null } | null;
  OrderStatus?: string | { name?: string | null; id?: number | string | null } | null;
  vehiclePlate?: string | null;
  estimatedDeliveryDate?: string | null;
  EstimatedDeliveryDate?: string | null;
  estimatedDeliveryAt?: string | null;
  EstimatedDeliveryAt?: string | null;
  estimatedDeliveryDateTime?: string | null;
  EstimatedDeliveryDateTime?: string | null;
  deliveryDate?: string | null;
  DeliveryDate?: string | null;
  paymentStatus?: string | null;
  paymentMessage?: string | null;
  workPerformed?: string | null;
  generalDescription?: string | null;
  services?: unknown[];
  orderServices?: unknown[];
  additionalRequests?: unknown[];
};

type ApiPayment = Partial<ClientPayment> & {
  id: number | string;
  invoiceId?: number | string;
  serviceOrderId?: number | string;
  clientPersonId?: number | string | null;
  customer?: string | null;
  paymentMethod?: string | null;
  method?: string | null;
  invoiceNumber?: string | null;
  orderCode?: string | null;
  amount?: number | string | null;
  reference?: string | null;
  status?: string | null;
  createdAt?: string | null;
  date?: string | null;
  deliveryDate?: string | null;
};

type ApiPagedResult<T> = {
  items?: T[];
  Items?: T[];
  totalCount?: number;
  TotalCount?: number;
};

type ApiPart = {
  id?: number | string;
  Id?: number | string;
  code?: string;
  Code?: string;
  description?: string;
  Description?: string;
  stock?: number | string;
  Stock?: number | string;
  minimumStock?: number | string;
  MinimumStock?: number | string;
  unitPrice?: number | string;
  UnitPrice?: number | string;
  isActive?: boolean;
  IsActive?: boolean;
  category?: string;
  Category?: string;
  brand?: string | null;
  Brand?: string | null;
  stockStatus?: string;
  StockStatus?: string;
};

type ApiStockMovement = Partial<StockMovement> & {
  id?: number | string;
  Id?: number | string;
  partId?: number | string;
  PartId?: number | string;
  partCode?: string;
  PartCode?: string;
  partName?: string;
  PartName?: string;
  quantityChange?: number | string;
  QuantityChange?: number | string;
  resultingStock?: number | string;
  ResultingStock?: number | string;
  unitPrice?: number | string;
  UnitPrice?: number | string;
  action?: string;
  Action?: string;
  comment?: string | null;
  Comment?: string | null;
  createdAt?: string;
  CreatedAt?: string;
};

type ApiStockSubmission = Partial<StockSubmission> & {
  id?: number | string;
  Id?: number | string;
  productName?: string;
  ProductName?: string;
  referenceCode?: string;
  ReferenceCode?: string;
  supplierId?: number | string;
  SupplierId?: number | string;
  supplier?: string;
  Supplier?: string;
  supplierPrice?: number | string;
  SupplierPrice?: number | string;
  profitPercentage?: number | string;
  ProfitPercentage?: number | string;
  salePrice?: number | string;
  SalePrice?: number | string;
  quantity?: number | string;
  Quantity?: number | string;
  minimumStock?: number | string;
  MinimumStock?: number | string;
  categoryName?: string | null;
  CategoryName?: string | null;
  brandName?: string | null;
  BrandName?: string | null;
  description?: string | null;
  Description?: string | null;
  warehouseComment?: string | null;
  WarehouseComment?: string | null;
  inventoryManagerComment?: string | null;
  InventoryManagerComment?: string | null;
  status?: string;
  Status?: string;
  createdAt?: string;
  CreatedAt?: string;
};

type ApiCatalogItem = {
  id?: number | string;
  Id?: number | string;
  name?: string;
  Name?: string;
};

type ApiWorkshopServicePart = {
  partId?: number | string;
  PartId?: number | string;
  partName?: string;
  PartName?: string;
  quantityRequired?: number | string;
  QuantityRequired?: number | string;
  unitSalePrice?: number | string;
  UnitSalePrice?: number | string;
};

type ApiWorkshopService = Partial<WorkshopService> & {
  id?: number | string;
  Id?: number | string;
  laborPercentage?: number | string;
  LaborPercentage?: number | string;
  partsSubtotal?: number | string;
  PartsSubtotal?: number | string;
  laborAmount?: number | string;
  LaborAmount?: number | string;
  finalPrice?: number | string;
  FinalPrice?: number | string;
  status?: string;
  Status?: string;
  parts?: ApiWorkshopServicePart[];
  Parts?: ApiWorkshopServicePart[];
};

type ApiMechanicDiagnostic = Partial<MechanicDiagnostic> & {
  id?: number | string;
  Id?: number | string;
  serviceOrderId?: number | string;
  ServiceOrderId?: number | string;
  orderCode?: string;
  OrderCode?: string;
  customer?: string;
  Customer?: string;
  vehicle?: string;
  Vehicle?: string;
  mechanicPersonId?: number | string;
  MechanicPersonId?: number | string;
  mechanic?: string;
  Mechanic?: string;
  status?: string;
  Status?: string;
  findings?: string;
  Findings?: string;
  recommendedWork?: string;
  RecommendedWork?: string;
  workshopChiefComment?: string | null;
  WorkshopChiefComment?: string | null;
  submittedAt?: string;
  SubmittedAt?: string;
  reviewedAt?: string | null;
  ReviewedAt?: string | null;
};

function normalizeOrderService(service: unknown, index: number) {
  const item = service as Record<string, unknown>;
  return {
    id: String(item.id ?? item.orderServiceId ?? `service-${index}`),
    serviceOrderId: item.serviceOrderId ? String(item.serviceOrderId) : undefined,
    name: String(item.name ?? item.serviceName ?? item.description ?? "Servicio"),
    status: String(item.status ?? "Pending") as OrderServiceItem["status"],
    parts: Array.isArray(item.parts) ? item.parts.map(String) : [],
    workPerformed: item.workPerformed ? String(item.workPerformed) : undefined,
    price: Number(item.price ?? item.total ?? item.finalPrice ?? 0),
  };
}

function unwrapPagedItems<T>(data: T[] | ApiPagedResult<T>) {
  if (Array.isArray(data)) return data;
  return data.items ?? data.Items ?? [];
}

function normalizeInventoryPart(part: ApiPart): WarehouseProduct {
  const id = String(part.id ?? part.Id ?? "");
  const description = String(part.description ?? part.Description ?? "Repuesto");
  const code = String(part.code ?? part.Code ?? id);
  const stock = Number(part.stock ?? part.Stock ?? 0);
  const unitPrice = Number(part.unitPrice ?? part.UnitPrice ?? 0);
  return {
    id,
    name: description,
    referenceCode: code,
    supplier: "Inventario",
    supplierPrice: unitPrice,
    profitPercentage: 0,
    salePrice: unitPrice,
    quantity: stock,
    category: String(part.category ?? part.Category ?? "Repuesto"),
    brand: String(part.brand ?? part.Brand ?? ""),
    description,
    minimumStock: Number(part.minimumStock ?? part.MinimumStock ?? 0),
  };
}

function normalizeStockMovement(movement: ApiStockMovement): StockMovement {
  return {
    id: String(movement.id ?? movement.Id ?? ""),
    partId: String(movement.partId ?? movement.PartId ?? ""),
    partCode: String(movement.partCode ?? movement.PartCode ?? ""),
    partName: String(movement.partName ?? movement.PartName ?? "Repuesto"),
    quantityChange: Number(movement.quantityChange ?? movement.QuantityChange ?? 0),
    resultingStock: Number(movement.resultingStock ?? movement.ResultingStock ?? 0),
    unitPrice: Number(movement.unitPrice ?? movement.UnitPrice ?? 0),
    action: String(movement.action ?? movement.Action ?? "Movimiento"),
    comment: movement.comment ?? movement.Comment ?? undefined,
    createdAt: String(movement.createdAt ?? movement.CreatedAt ?? ""),
  };
}

function normalizeStockSubmission(submission: ApiStockSubmission): StockSubmission {
  const id = String(submission.id ?? submission.Id ?? submission.submissionId ?? "");
  const supplierPrice = Number(submission.supplierPrice ?? submission.SupplierPrice ?? 0);
  const profitPercentage = Number(submission.profitPercentage ?? submission.ProfitPercentage ?? 0);
  return {
    id,
    submissionId: id,
    name: String(submission.name ?? submission.productName ?? submission.ProductName ?? "Producto"),
    referenceCode: String(submission.referenceCode ?? submission.ReferenceCode ?? ""),
    supplier: String(submission.supplier ?? submission.Supplier ?? (submission.supplierId ?? submission.SupplierId ? `Proveedor #${submission.supplierId ?? submission.SupplierId}` : "Proveedor")),
    supplierPrice,
    profitPercentage,
    salePrice: Number(submission.salePrice ?? submission.SalePrice ?? calculateProductSalePrice(supplierPrice, profitPercentage)),
    quantity: Number(submission.quantity ?? submission.Quantity ?? 0),
    category: String(submission.category ?? submission.categoryName ?? submission.CategoryName ?? "Repuesto"),
    brand: String(submission.brand ?? submission.brandName ?? submission.BrandName ?? ""),
    description: String(submission.description ?? submission.Description ?? ""),
    minimumStock: Number(submission.minimumStock ?? submission.MinimumStock ?? 0),
    observations: submission.observations,
    submittedAt: String(submission.submittedAt ?? submission.createdAt ?? submission.CreatedAt ?? ""),
    warehouseChief: String(submission.warehouseChief ?? "Jefe de stock"),
    status: String(submission.status ?? submission.Status ?? "Draft") as StockSubmission["status"],
    warehouseComment: submission.warehouseComment ?? submission.WarehouseComment ?? undefined,
    inventoryManagerComment: submission.inventoryManagerComment ?? submission.InventoryManagerComment ?? undefined,
  };
}

function normalizeCatalogItem(item: ApiCatalogItem) {
  return {
    id: String(item.id ?? item.Id ?? ""),
    name: String(item.name ?? item.Name ?? "Sin nombre"),
  };
}

function normalizeWorkshopService(service: ApiWorkshopService): WorkshopService {
  const parts = (service.parts ?? service.Parts ?? []).map((part) => ({
    partId: String(part.partId ?? part.PartId ?? ""),
    name: String(part.partName ?? part.PartName ?? "Repuesto"),
    quantity: Number(part.quantityRequired ?? part.QuantityRequired ?? 1),
    salePrice: Number(part.unitSalePrice ?? part.UnitSalePrice ?? 0),
  }));

  return {
    id: String(service.id ?? service.Id ?? ""),
    name: String(service.name ?? "Servicio"),
    description: String(service.description ?? ""),
    category: String(service.category ?? ""),
    parts,
    laborPercentage: Number(service.laborPercentage ?? service.LaborPercentage ?? 0),
    partsTotal: Number(service.partsTotal ?? service.partsSubtotal ?? service.PartsSubtotal ?? 0),
    laborValue: Number(service.laborValue ?? service.laborAmount ?? service.LaborAmount ?? 0),
    finalPrice: Number(service.finalPrice ?? service.FinalPrice ?? 0),
    status: String(service.status ?? service.Status ?? "Active") as WorkshopService["status"],
  };
}

function toWorkshopServicePayload(payload: Pick<WorkshopService, "name" | "description" | "category" | "laborPercentage" | "parts">) {
  return {
    name: payload.name,
    description: payload.description,
    category: payload.category,
    laborPercentage: payload.laborPercentage,
    parts: payload.parts.map((part) => ({
      partId: Number(part.partId),
      quantityRequired: Number(part.quantity),
    })),
  };
}

function requestOrderCode(item: Record<string, unknown>) {
  if (item.orderCode ?? item.OrderCode) return String(item.orderCode ?? item.OrderCode);
  const orderId = item.orderId ?? item.serviceOrderId ?? item.ServiceOrderId;
  const createdAt = typeof (item.createdAt ?? item.CreatedAt) === "string" ? String(item.createdAt ?? item.CreatedAt) : undefined;
  return orderId ? toOrderCode(String(orderId), createdAt) : "Orden sin número";
}

function normalizeAdditionalRequest(request: unknown, index: number): AdditionalRequest {
  const item = request as Partial<AdditionalRequest> & Record<string, unknown>;
  return {
    id: String(item.id ?? item.Id ?? item.additionalServiceRequestId ?? item.AdditionalServiceRequestId ?? `request-${index}`),
    createdAt: String(item.createdAt ?? item.CreatedAt ?? ""),
    orderId: String(item.orderId ?? item.serviceOrderId ?? item.ServiceOrderId ?? ""),
    orderCode: requestOrderCode(item),
    customer: String(item.customer ?? item.Customer ?? "Cliente"),
    vehicle: String(item.vehicle ?? item.Vehicle ?? "Vehículo"),
    mechanic: String(item.mechanic ?? item.Mechanic ?? "Mecánico"),
    requestType: item.requestType === "Part" ? "Part" : "Service",
    suggestedService: String(item.suggestedService ?? item.serviceName ?? item.workshopServiceName ?? "Solicitud adicional"),
    suggestedPart: item.suggestedPart || item.partName || item.PartName ? String(item.suggestedPart ?? item.partName ?? item.PartName) : undefined,
    quantity: item.quantity === undefined || item.quantity === null ? undefined : Number(item.quantity),
    problemDescription: String(item.problemDescription ?? item.technicalComment ?? "Sin descripción."),
    technicalJustification: String(item.technicalJustification ?? item.technicalComment ?? "Sin comentario técnico."),
    observations: item.observations ? String(item.observations) : undefined,
    workshopChiefComment: item.workshopChiefComment ? String(item.workshopChiefComment) : undefined,
    clientComment: item.clientComment ? String(item.clientComment) : undefined,
    estimatedPrice: Number(item.estimatedPrice ?? 0),
    status: String(item.status ?? "PendingClientApproval") as AdditionalRequest["status"],
    priority: item.priority === "Baja" || item.priority === "Alta" ? item.priority : "Media",
    decisionHistory: Array.isArray(item.decisionHistory) ? item.decisionHistory.map(String) : [],
  };
}

function normalizeMechanicDiagnostic(diagnostic: ApiMechanicDiagnostic): MechanicDiagnostic {
  return {
    id: String(diagnostic.id ?? diagnostic.Id ?? ""),
    serviceOrderId: String(diagnostic.serviceOrderId ?? diagnostic.ServiceOrderId ?? ""),
    orderCode: String(diagnostic.orderCode ?? diagnostic.OrderCode ?? "Orden sin número"),
    customer: String(diagnostic.customer ?? diagnostic.Customer ?? "Cliente"),
    vehicle: String(diagnostic.vehicle ?? diagnostic.Vehicle ?? "Vehículo"),
    mechanicPersonId: String(diagnostic.mechanicPersonId ?? diagnostic.MechanicPersonId ?? ""),
    mechanic: String(diagnostic.mechanic ?? diagnostic.Mechanic ?? "Mecánico"),
    status: String(diagnostic.status ?? diagnostic.Status ?? "PendingWorkshopChiefApproval") as MechanicDiagnostic["status"],
    findings: String(diagnostic.findings ?? diagnostic.Findings ?? ""),
    recommendedWork: String(diagnostic.recommendedWork ?? diagnostic.RecommendedWork ?? ""),
    workshopChiefComment: diagnostic.workshopChiefComment ?? diagnostic.WorkshopChiefComment ?? undefined,
    submittedAt: String(diagnostic.submittedAt ?? diagnostic.SubmittedAt ?? ""),
    reviewedAt: String(diagnostic.reviewedAt ?? diagnostic.ReviewedAt ?? ""),
  };
}

function toOrderCode(id: number | string, entryDate?: string) {
  const parsedDate = entryDate ? new Date(entryDate) : null;
  const year = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.getFullYear() : new Date().getFullYear();
  return `OT-${year}-${String(id).padStart(4, "0")}`;
}

function toPaymentStatus(status?: string | null): PaymentStatus | undefined {
  if (!status) return undefined;
  if (status === "Pending") return "PendingPayment";
  if (status === "Verified") return "Approved";
  if (["PendingPayment", "PendingReceptionVerification", "Approved", "Rejected", "Refunded"].includes(status)) {
    return status as PaymentStatus;
  }
  return undefined;
}

function normalizeOrderStatus(order: ApiClientOrder) {
  const orderStatus = order.orderStatus ?? order.OrderStatus;
  const rawStatus = typeof orderStatus === "object" ? orderStatus?.name : order.status ?? orderStatus;
  const statusId = order.orderStatusId ?? order.OrderStatusId ?? order.statusId ?? order.StatusId ?? (typeof orderStatus === "object" ? orderStatus?.id : undefined);
  const normalized = String(rawStatus ?? "").replace(/\s+/g, "").toLowerCase();

  if (String(statusId) === "5" || normalized === "pendingclientapproval" || normalized === "pendienteaprobacioncliente") {
    return "PendingClientApproval";
  }
  if (String(statusId) === "6" || normalized === "waitingforpayment") {
    return "WaitingForPayment";
  }
  if (String(statusId) === "7" || normalized === "paymentunderreview") {
    return "PaymentUnderReview";
  }
  if (String(statusId) === "4" || normalized === "inprogress") {
    return "InProgress";
  }

  return String(rawStatus ?? "Created");
}

function normalizeDate(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

function addDaysDate(value: unknown, days: number) {
  const date = value ? new Date(String(value)) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function normalizeOrderServices(order: ApiClientOrder): OrderServiceItem[] {
  const services = (order.orderServices ?? order.services ?? []).map(normalizeOrderService);
  if (services.length > 0) return services;

  const workPerformed = order.workPerformed?.trim();
  const generalDescription = order.generalDescription?.trim();
  const description = workPerformed || generalDescription;
  if (!description) return [];

  return [{
    id: `${order.id}-work-performed`,
    name: generalDescription || "Trabajo realizado",
    status: String(order.status ?? "InProgress") as OrderServiceItem["status"],
    parts: [],
    workPerformed: description,
    price: Number(order.estimatedTotal ?? 0),
  }];
}

function normalizeClientOrder(order: ApiClientOrder): ServiceOrder {
  const id = String(order.id);
  const status = normalizeOrderStatus(order);
  const entryDate = normalizeDate(order.entryDate ?? (order as Record<string, unknown>).EntryDate);
  const estimatedDelivery = normalizeDate(
    order.estimatedDelivery ??
    order.estimatedDeliveryDate ??
    order.EstimatedDeliveryDate ??
    order.estimatedDeliveryAt ??
    order.EstimatedDeliveryAt ??
    order.estimatedDeliveryDateTime ??
    order.EstimatedDeliveryDateTime ??
    order.deliveryDate ??
    order.DeliveryDate,
  ) || addDaysDate(entryDate, 3);
  return {
    id,
    code: order.code ?? toOrderCode(order.id, order.entryDate),
    customer: order.customer ?? "Cliente",
    vehicle: order.vehicle ?? order.vehiclePlate ?? "Vehículo sin placa",
    status,
    mechanic: order.mechanic ?? "Sin asignar",
    entryDate,
    estimatedDelivery,
    estimatedTotal: order.estimatedTotal ?? 0,
    invoiceId: order.invoiceId,
    canPay: order.canPay,
    paymentStatus: toPaymentStatus(order.paymentStatus),
    paymentMessage: order.paymentMessage ?? undefined,
    deliveryDate: order.deliveryDate ?? undefined,
    workPerformed: order.workPerformed ?? undefined,
    generalDescription: order.generalDescription ?? undefined,
    orderServices: normalizeOrderServices(order),
    additionalRequests: (order.additionalRequests ?? []).map(normalizeAdditionalRequest),
  };
}

function normalizePayment(payment: ApiPayment, fallbackCustomer = getSessionCustomerName()): ClientPayment {
  const orderId = String(payment.orderId ?? payment.serviceOrderId ?? "");
  const customer = String(payment.customer ?? "");
  return {
    id: String(payment.id),
    orderId,
    orderCode: String(payment.orderCode ?? (orderId ? toOrderCode(orderId) : "Orden sin número")),
    invoiceNumber: String(payment.invoiceNumber ?? (payment.invoiceId ? `FV-${String(payment.invoiceId).padStart(4, "0")}` : "Factura sin número")),
    customer: isPlaceholderCustomerName(customer) ? fallbackCustomer : customer,
    clientNumber: payment.clientPersonId === undefined || payment.clientPersonId === null ? undefined : String(payment.clientPersonId),
    method: String(payment.paymentMethod ?? payment.method ?? "Método no registrado"),
    amount: Number(payment.amount ?? 0),
    reference: String(payment.reference ?? ""),
    date: String(payment.date ?? payment.createdAt ?? ""),
    status: toPaymentStatus(payment.status) ?? "PendingPayment",
    deliveryDate: payment.deliveryDate ?? undefined,
  };
}

async function getMappedClientOrders() {
  const response = await apiClient.get<ApiClientOrder[]>("/api/client/orders");
  return response.data.map(normalizeClientOrder);
}

async function getMappedClientPayments() {
  const [paymentsResponse, orders] = await Promise.all([
    apiClient.get<ApiPayment[]>("/api/client/payments"),
    getMappedClientOrders().catch(() => []),
  ]);
  const ordersById = new Map(orders.map((order) => [order.id, order]));
  const ordersByCode = new Map(orders.map((order) => [order.code, order]));

  return paymentsResponse.data.map((payment) => {
    const orderId = String(payment.orderId ?? payment.serviceOrderId ?? "");
    const orderCode = String(payment.orderCode ?? "");
    const order = ordersById.get(orderId) ?? ordersByCode.get(orderCode);
    return normalizePayment(payment, isPlaceholderCustomerName(order?.customer) ? getSessionCustomerName() : order?.customer);
  });
}

async function getMappedClientPaymentById(paymentId: string) {
  const payments = await getMappedClientPayments();
  const payment = payments.find((item) => item.id === paymentId);
  if (!payment) {
    throw {
      name: "Not Found",
      message: "No se encontró el pago solicitado.",
      status: 404,
      statusText: "Not Found",
    };
  }
  return payment;
}

async function getMappedClientMessages() {
  const response = await apiClient.get<unknown[]>("/api/client/messages");
  return response.data.map((message, index) => {
    if (typeof message === "string") return message;

    const request = normalizeAdditionalRequest(message, index);
    const detail = request.workshopChiefComment || request.clientComment || request.technicalJustification || request.problemDescription;
    return `${request.orderCode} · ${request.suggestedService}: ${detail}`;
  });
}

async function getMappedClientApprovals() {
  const response = await apiClient.get<AdditionalRequest[]>("/api/client/approvals");
  return response.data.map(normalizeAdditionalRequest);
}

async function getMappedClientOrderById(orderId: string) {
  const response = await apiClient.get<ApiClientOrder>(`/api/client/orders/${orderId}`);
  return normalizeClientOrder(response.data);
}

export function calculateProductSalePrice(supplierPrice: number, profitPercentage: number) {
  return supplierPrice + (supplierPrice * profitPercentage) / 100;
}

export function calculateWorkshopServicePrice(parts: WorkshopServicePart[], laborPercentage: number) {
  const partsTotal = parts.reduce((total, part) => total + part.salePrice * part.quantity, 0);
  const laborValue = (partsTotal * laborPercentage) / 100;
  return {
    partsTotal,
    laborValue,
    finalPrice: partsTotal + laborValue,
  };
}

export const operationsService = {
  createAdditionalRequest: (payload: Partial<AdditionalRequest> & { workshopServiceId?: string; partId?: string }) => {
    const body = {
      requestType: payload.requestType === "Part" ? 2 : 1,
      workshopServiceId: payload.workshopServiceId ? Number(payload.workshopServiceId) : undefined,
      partId: payload.partId ? Number(payload.partId) : undefined,
      quantity: payload.quantity ? Number(payload.quantity) : undefined,
      technicalComment: [payload.problemDescription, payload.technicalJustification, payload.observations].filter(Boolean).join("\n\n"),
    };
    return apiData(apiClient.post<AdditionalRequest>(`/api/mechanic/orders/${payload.orderId}/additional-requests`, body));
  },
  getMechanicRequests: () =>
    apiData(apiClient.get<unknown[]>("/api/mechanic/requests")).then((requests) => requests.map(normalizeAdditionalRequest)),
  getMechanicOrders: () => apiData(apiClient.get<ServiceOrder[]>("/api/mechanic/orders")),
  getMechanicOrderById: (orderId: string) =>
    apiData(apiClient.get<ServiceOrder>(`/api/mechanic/orders/${orderId}`)),
  registerMechanicWork: (orderId: string, payload: { workPerformed: string; observations?: string }) =>
    apiData(apiClient.post(`/api/mechanic/orders/${orderId}/work`, payload)),
  completeMechanicOrder: (orderId: string, payload: { workPerformed: string }) =>
    apiData(apiClient.post(`/api/mechanic/orders/${orderId}/complete`, payload)),
  updateMechanicOrderServiceStatus: (orderServiceId: string, status: string) =>
    apiData(apiClient.patch(`/api/mechanic/order-services/${orderServiceId}/status`, { status })),
  getMechanicDiagnostics: () =>
    apiData(apiClient.get<ApiMechanicDiagnostic[]>("/api/mechanic/diagnostics")).then((items) => items.map(normalizeMechanicDiagnostic)),
  submitMechanicDiagnostic: (orderId: string, payload: { findings: string; recommendedWork: string }) =>
    apiData(apiClient.post<ApiMechanicDiagnostic>(`/api/mechanic/orders/${orderId}/diagnostics`, payload)).then(normalizeMechanicDiagnostic),
  getMechanicSpecialties: () =>
    apiData(apiClient.get<Array<{ id: number; name: string }>>("/api/mechanics-catalog/specialties")),
  getMechanicsBySpecialty: (specialtyName: string) =>
    apiData(apiClient.get<Array<{ personId: number; fullName: string; specialtyId: number; specialtyName: string }>>("/api/mechanics-catalog/mechanics", { params: { specialtyName } })),
  getWorkshopChiefRequests: () =>
    apiData(apiClient.get<unknown[]>("/api/workshop-chief/requests")).then((requests) => requests.map(normalizeAdditionalRequest)),
  getWorkshopChiefRequestById: (requestId: string) =>
    apiData(apiClient.get<unknown>(`/api/workshop-chief/requests/${requestId}`)).then((request) => normalizeAdditionalRequest(request, 0)),
  approveRequestByWorkshopChief: (requestId: string, comment: string) =>
    apiData(apiClient.post<AdditionalRequest>(`/api/workshop-chief/requests/${requestId}/approve`, { comment })),
  rejectRequestByWorkshopChief: (requestId: string, comment: string) =>
    apiData(apiClient.post<AdditionalRequest>(`/api/workshop-chief/requests/${requestId}/reject`, { comment })),
  getWorkshopChiefDiagnostics: () =>
    apiData(apiClient.get<ApiMechanicDiagnostic[]>("/api/workshop-chief/diagnostics")).then((items) => items.map(normalizeMechanicDiagnostic)),
  getWorkshopChiefDiagnosticById: (diagnosticId: string) =>
    apiData(apiClient.get<ApiMechanicDiagnostic>(`/api/workshop-chief/diagnostics/${diagnosticId}`)).then(normalizeMechanicDiagnostic),
  approveMechanicDiagnostic: (diagnosticId: string, comment: string) =>
    apiData(apiClient.post<ApiMechanicDiagnostic>(`/api/workshop-chief/diagnostics/${diagnosticId}/approve`, { comment })).then(normalizeMechanicDiagnostic),
  rejectMechanicDiagnostic: (diagnosticId: string, comment: string) =>
    apiData(apiClient.post<ApiMechanicDiagnostic>(`/api/workshop-chief/diagnostics/${diagnosticId}/reject`, { comment })).then(normalizeMechanicDiagnostic),
  getClientPendingApprovals: getMappedClientApprovals,
  approveRequestByClient: (requestId: string) =>
    apiData(apiClient.post<AdditionalRequest>(`/api/client/approvals/${requestId}/approve`, { comment: "" })),
  rejectRequestByClient: (requestId: string, comment?: string) =>
    apiData(apiClient.post<AdditionalRequest>(`/api/client/approvals/${requestId}/reject`, { comment: comment?.trim() || "Rechazado por el cliente." })),

  getClientOrders: getMappedClientOrders,
  getClientOrderById: getMappedClientOrderById,
  approveClientOrder: (orderId: string) =>
    apiData(apiClient.post<ServiceOrder>(`/api/client/orders/${orderId}/approve`, { comment: "" })).then((order) => normalizeClientOrder(order as ApiClientOrder)),
  rejectClientOrder: (orderId: string) =>
    apiData(apiClient.post<ServiceOrder>(`/api/client/orders/${orderId}/reject`, { comment: "Rechazada por el cliente." })).then((order) => normalizeClientOrder(order as ApiClientOrder)),
  getClientMessages: getMappedClientMessages,
  getClientPayments: getMappedClientPayments,
  getClientPaymentById: getMappedClientPaymentById,

  createWarehouseProduct: (payload: Omit<WarehouseProduct, "id" | "salePrice">) =>
    apiData(apiClient.post<WarehouseProduct>("/api/warehouse/products", payload)),
  updateWarehouseProduct: (id: string, payload: Partial<WarehouseProduct>) =>
    apiData(apiClient.put<WarehouseProduct>(`/api/warehouse/products/${id}`, payload)),
  getWarehouseProducts: () =>
    apiData(apiClient.get<ApiPart[]>("/api/stock/parts")).then((parts) => parts.map(normalizeInventoryPart)),
  getStockDashboard: () =>
    apiData(apiClient.get<StockDashboard>("/api/stock/dashboard")).then((dashboard) => ({
      ...dashboard,
      recentMovements: (dashboard.recentMovements ?? []).map(normalizeStockMovement),
    })),
  getStockParts: (params?: { search?: string; stockStatus?: string }) =>
    apiData(apiClient.get<ApiPart[]>("/api/stock/parts", { params })).then((parts) => parts.map(normalizeInventoryPart)),
  getStockMovements: () =>
    apiData(apiClient.get<ApiStockMovement[]>("/api/stock/movements")).then((movements) => movements.map(normalizeStockMovement)),
  registerStockIn: (payload: { partId: string; quantity: number; comment?: string }) =>
    apiData(apiClient.post<ApiStockMovement>("/api/stock/movements/in", {
      partId: Number(payload.partId),
      quantity: payload.quantity,
      comment: payload.comment,
    })).then(normalizeStockMovement),
  registerStockOut: (payload: { partId: string; quantity: number; comment?: string }) =>
    apiData(apiClient.post<ApiStockMovement>("/api/stock/movements/out", {
      partId: Number(payload.partId),
      quantity: payload.quantity,
      comment: payload.comment,
    })).then(normalizeStockMovement),
  createStockSubmission: (payload: Partial<StockSubmission> & {
    productName?: string;
    supplierId?: string | number;
    partCategoryId?: string | number | null;
    partBrandId?: string | number | null;
    categoryName?: string;
    brandName?: string;
  }) => {
    const body = {
      productName: payload.productName ?? payload.name,
      referenceCode: payload.referenceCode,
      supplierId: Number(payload.supplierId),
      supplierPrice: Number(payload.supplierPrice ?? 0),
      profitPercentage: Number(payload.profitPercentage ?? 0),
      quantity: Number(payload.quantity ?? 0),
      minimumStock: Number(payload.minimumStock ?? 0),
      partCategoryId: payload.partCategoryId ? Number(payload.partCategoryId) : undefined,
      partBrandId: payload.partBrandId ? Number(payload.partBrandId) : undefined,
      categoryName: payload.categoryName ?? payload.category,
      brandName: payload.brandName ?? payload.brand,
      description: payload.description,
      warehouseComment: payload.observations,
    };
    return apiData(apiClient.post<ApiStockSubmission>("/api/warehouse/stock-submissions", body)).then(normalizeStockSubmission);
  },
  sendStockSubmissionForReview: (id: string) =>
    apiData(apiClient.post<ApiStockSubmission>(`/api/warehouse/stock-submissions/${id}/send-to-review`)).then(normalizeStockSubmission),
  getStockSubmissions: () =>
    apiData(apiClient.get<ApiStockSubmission[]>("/api/warehouse/stock-submissions")).then((submissions) => submissions.map(normalizeStockSubmission)),
  getStockSubmissionById: (id: string) =>
    apiData(apiClient.get<ApiStockSubmission>(`/api/warehouse/stock-submissions/${id}`)).then(normalizeStockSubmission),

  getInventoryReviewRequests: () =>
    apiData(apiClient.get<ApiStockSubmission[]>("/api/inventory/review-requests")).then((submissions) => submissions.map(normalizeStockSubmission)),
  getInventoryReviewRequestById: (id: string) =>
    apiData(apiClient.get<ApiStockSubmission>(`/api/inventory/review-requests/${id}`)).then(normalizeStockSubmission),
  approveStockSubmission: (id: string, comment: string) =>
    apiData(apiClient.post<ApiStockSubmission>(`/api/inventory/review-requests/${id}/approve`, { comment })).then(normalizeStockSubmission),
  rejectStockSubmission: (id: string, comment: string) =>
    apiData(apiClient.post<ApiStockSubmission>(`/api/inventory/review-requests/${id}/reject`, { comment })).then(normalizeStockSubmission),
  getInventoryProducts: () =>
    apiData(apiClient.get<ApiPart[]>("/api/inventory/products")).then((parts) => parts.map(normalizeInventoryPart)),
  getInventoryHistory: () =>
    apiData(apiClient.get<ApiStockMovement[]>("/api/inventory/history")).then((movements) => movements.map(normalizeStockMovement)),

  getAvailableWorkshopParts: async () => {
    const response = await apiClient.get<ApiPart[] | ApiPagedResult<ApiPart>>("/api/parts", { params: { pageNumber: 1, pageSize: 500 } });
    return unwrapPagedItems(response.data).map(normalizeInventoryPart).filter((part) => part.quantity > 0);
  },
  getWorkshopServices: () =>
    apiData(apiClient.get<ApiWorkshopService[]>("/api/workshop-services")).then((services) => services.map(normalizeWorkshopService)),
  getPartCategoriesForStock: () =>
    apiData(apiClient.get<ApiCatalogItem[] | ApiPagedResult<ApiCatalogItem>>("/api/partcategories", { params: { pageNumber: 1, pageSize: 500 } })).then((data) => unwrapPagedItems(data).map(normalizeCatalogItem)),
  getPartBrandsForStock: () =>
    apiData(apiClient.get<ApiCatalogItem[] | ApiPagedResult<ApiCatalogItem>>("/api/partbrands", { params: { pageNumber: 1, pageSize: 500 } })).then((data) => unwrapPagedItems(data).map(normalizeCatalogItem)),
  getSuppliersForStock: () =>
    apiData(apiClient.get<ApiCatalogItem[] | ApiPagedResult<ApiCatalogItem>>("/api/suppliers", { params: { pageNumber: 1, pageSize: 500 } })).then((data) => unwrapPagedItems(data).map(normalizeCatalogItem)),
  getWorkshopServiceById: (id: string) =>
    apiData(apiClient.get<ApiWorkshopService>(`/api/workshop-services/${id}`)).then(normalizeWorkshopService),
  createWorkshopService: (payload: Pick<WorkshopService, "name" | "description" | "category" | "laborPercentage" | "parts">) =>
    apiData(apiClient.post<ApiWorkshopService>("/api/workshop-services", toWorkshopServicePayload(payload))).then(normalizeWorkshopService),
  updateWorkshopService: (id: string, payload: Pick<WorkshopService, "name" | "description" | "category" | "laborPercentage" | "parts">) =>
    apiData(apiClient.put<ApiWorkshopService>(`/api/workshop-services/${id}`, toWorkshopServicePayload(payload))).then(normalizeWorkshopService),
  activateWorkshopService: (id: string) =>
    apiData(apiClient.patch<WorkshopService>(`/api/workshop-services/${id}/activate`)),
  deactivateWorkshopService: (id: string) =>
    apiData(apiClient.patch<WorkshopService>(`/api/workshop-services/${id}/deactivate`)),
  calculateWorkshopServicePrice,

  submitClientPayment: async (payload: ClientPaymentRequest) => {
    const response = await apiClient.post<ClientPayment>("/api/client/payments", payload);
    return response.data;
  },
  getPaymentsPendingReceptionVerification: () =>
    apiData(apiClient.get<ApiPayment[]>("/api/reception/payments/pending-verification")).then((payments) => payments.map((payment) => normalizePayment(payment))),
  getReceptionApprovedPayments: () =>
    apiData(apiClient.get<ApiPayment[]>("/api/reception/payments", { params: { status: "Approved" } })).then((payments) => payments.map((payment) => normalizePayment(payment))),
  getReceptionPaymentById: (paymentId: string) =>
    apiData(apiClient.get<ApiPayment>(`/api/reception/payments/${paymentId}`)).then(normalizePayment),
  approvePaymentByReception: (paymentId: string, deliveryDate?: string) =>
    apiData(apiClient.post<ClientPayment>(`/api/reception/payments/${paymentId}/approve`, { deliveryDate })),
  rejectPaymentByReception: (paymentId: string) =>
    apiData(apiClient.post<ClientPayment>(`/api/reception/payments/${paymentId}/reject`)),
  confirmVehicleDeliveryDate: (orderId: string, deliveryDate: string) =>
    apiData(apiClient.post<ClientPayment>(`/api/reception/orders/${orderId}/confirm-delivery-date`, { deliveryDate })),
};

export const {
  createAdditionalRequest,
  getMechanicRequests,
  getMechanicOrders,
  getMechanicOrderById,
  registerMechanicWork,
  completeMechanicOrder,
  updateMechanicOrderServiceStatus,
  getMechanicDiagnostics,
  submitMechanicDiagnostic,
  getMechanicSpecialties,
  getMechanicsBySpecialty,
  getWorkshopChiefRequests,
  getWorkshopChiefRequestById,
  approveRequestByWorkshopChief,
  rejectRequestByWorkshopChief,
  getWorkshopChiefDiagnostics,
  getWorkshopChiefDiagnosticById,
  approveMechanicDiagnostic,
  rejectMechanicDiagnostic,
  getClientPendingApprovals,
  approveRequestByClient,
  rejectRequestByClient,
  getClientMessages,
  getClientPayments,
  getClientPaymentById,
  createWarehouseProduct,
  updateWarehouseProduct,
  getWarehouseProducts,
  getStockDashboard,
  getStockParts,
  getStockMovements,
  registerStockIn,
  registerStockOut,
  createStockSubmission,
  sendStockSubmissionForReview,
  getStockSubmissions,
  getStockSubmissionById,
  getInventoryReviewRequests,
  getInventoryReviewRequestById,
  approveStockSubmission,
  rejectStockSubmission,
  getInventoryProducts,
  getAvailableWorkshopParts,
  getInventoryHistory,
  getWorkshopServices,
  getPartCategoriesForStock,
  getPartBrandsForStock,
  getSuppliersForStock,
  getWorkshopServiceById,
  createWorkshopService,
  updateWorkshopService,
  activateWorkshopService,
  deactivateWorkshopService,
  submitClientPayment,
  getPaymentsPendingReceptionVerification,
  getReceptionApprovedPayments,
  getReceptionPaymentById,
  approvePaymentByReception,
  rejectPaymentByReception,
  confirmVehicleDeliveryDate,
} = operationsService;
