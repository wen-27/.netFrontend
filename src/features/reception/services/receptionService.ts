import { apiClient, getPaginated } from "../../../services/apiClient";
import { QueryParams } from "../../../shared/types/common";

export type ReceptionCustomer = {
  id: string;
  documentType: string;
  documentNumber: string;
  fullName: string;
  primaryEmail: string;
  primaryPhone: string;
  vehiclesCount: number;
  status: string;
};

export type ReceptionVehicle = {
  id: string;
  plate: string;
  vin: string;
  brand: string;
  model: string;
  type: string;
  year: number;
  color?: string;
  mileage: number;
  currentOwnerId?: string;
  currentOwner: string;
  activeOrders: number;
  isActive: boolean;
};

export type ReceptionOwnerHistory = {
  id: string;
  vehicleId: string;
  personId: string;
  owner: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
};

export type ReceptionPayment = {
  id: string;
  invoiceId: string;
  serviceOrderId: string;
  clientPersonId?: string;
  customer: string;
  clientDocument?: string;
  vehicle: string;
  amount: number;
  total: number;
  balance: number;
  method: string;
  status: string;
  date: string;
  reference: string;
};

type ApiCatalog = Record<string, unknown>;

function readId(item: ApiCatalog) {
  return String(item.id ?? item.Id ?? "");
}

function readName(item: ApiCatalog) {
  return String(item.name ?? item.Name ?? item.code ?? item.Code ?? item.brandName ?? item.BrandName ?? item.modelName ?? item.ModelName ?? "");
}

function mapCustomer(item: Record<string, unknown>): ReceptionCustomer {
  return {
    id: readId(item),
    documentType: String(item.documentType ?? item.DocumentType ?? ""),
    documentNumber: String(item.documentNumber ?? item.DocumentNumber ?? ""),
    fullName: String(item.fullName ?? item.FullName ?? ""),
    primaryEmail: String(item.primaryEmail ?? item.PrimaryEmail ?? ""),
    primaryPhone: String(item.primaryPhone ?? item.PrimaryPhone ?? ""),
    vehiclesCount: Number(item.vehiclesCount ?? item.VehiclesCount ?? 0),
    status: String(item.status ?? item.Status ?? "Activo"),
  };
}

function mapVehicle(item: Record<string, unknown>): ReceptionVehicle {
  return {
    id: readId(item),
    plate: String(item.plate ?? item.Plate ?? item.vin ?? item.Vin ?? ""),
    vin: String(item.vin ?? item.Vin ?? ""),
    brand: String(item.brand ?? item.Brand ?? ""),
    model: String(item.model ?? item.Model ?? ""),
    type: String(item.type ?? item.Type ?? ""),
    year: Number(item.year ?? item.Year ?? 0),
    color: item.color || item.Color ? String(item.color ?? item.Color) : undefined,
    mileage: Number(item.mileage ?? item.Mileage ?? 0),
    currentOwnerId: item.currentOwnerId ?? item.CurrentOwnerId ? String(item.currentOwnerId ?? item.CurrentOwnerId) : undefined,
    currentOwner: String(item.currentOwner ?? item.CurrentOwner ?? "Sin propietario"),
    activeOrders: Number(item.activeOrders ?? item.ActiveOrders ?? 0),
    isActive: Boolean(item.isActive ?? item.IsActive ?? true),
  };
}

function mapOwnerHistory(item: Record<string, unknown>): ReceptionOwnerHistory {
  return {
    id: readId(item),
    vehicleId: String(item.vehicleId ?? item.VehicleId ?? ""),
    personId: String(item.personId ?? item.PersonId ?? ""),
    owner: String(item.owner ?? item.Owner ?? ""),
    startDate: String(item.startDate ?? item.StartDate ?? ""),
    endDate: item.endDate || item.EndDate ? String(item.endDate ?? item.EndDate) : undefined,
    isCurrent: Boolean(item.isCurrent ?? item.IsCurrent ?? false),
  };
}

function mapPayment(item: Record<string, unknown>): ReceptionPayment {
  return {
    id: readId(item),
    invoiceId: String(item.invoiceId ?? item.InvoiceId ?? ""),
    serviceOrderId: String(item.serviceOrderId ?? item.ServiceOrderId ?? ""),
    clientPersonId: item.clientPersonId ?? item.ClientPersonId ? String(item.clientPersonId ?? item.ClientPersonId) : undefined,
    customer: String(item.customer ?? item.Customer ?? "Cliente"),
    clientDocument: item.clientDocument || item.ClientDocument ? String(item.clientDocument ?? item.ClientDocument) : undefined,
    vehicle: String(item.vehicle ?? item.Vehicle ?? ""),
    amount: Number(item.amount ?? item.Amount ?? 0),
    total: Number(item.total ?? item.Total ?? 0),
    balance: Number(item.balance ?? item.Balance ?? 0),
    method: String(item.method ?? item.Method ?? ""),
    status: String(item.status ?? item.Status ?? ""),
    date: String(item.date ?? item.Date ?? ""),
    reference: String(item.reference ?? item.Reference ?? ""),
  };
}

export const receptionService = {
  dashboard: () => apiClient.get("/api/reception/dashboard").then((response) => response.data),
  customers: (params: QueryParams) => getPaginated<Record<string, unknown>>("/api/reception/customers", params).then((page) => ({ ...page, data: page.data.map(mapCustomer) })),
  customer: (id: string) => apiClient.get<Record<string, unknown>>(`/api/reception/customers/${id}`).then((response) => mapCustomer(response.data)),
  createCustomer: (payload: unknown) => apiClient.post("/api/reception/customers", payload),
  customerVehicles: (id: string) => apiClient.get<Record<string, unknown>[]>(`/api/reception/customers/${id}/vehicles`).then((response) => response.data.map(mapVehicle)),
  vehicles: (params: QueryParams & { clientPersonId?: string }) => getPaginated<Record<string, unknown>>("/api/reception/vehicles", params).then((page) => ({ ...page, data: page.data.map(mapVehicle) })),
  vehicle: (id: string) => apiClient.get<Record<string, unknown>>(`/api/reception/vehicles/${id}`).then((response) => mapVehicle(response.data)),
  createVehicle: (payload: unknown) => apiClient.post("/api/reception/vehicles", payload),
  vehicleOwnerHistory: (id: string) => apiClient.get<Record<string, unknown>[]>(`/api/reception/vehicles/${id}/owner-history`).then((response) => response.data.map(mapOwnerHistory)),
  transferVehicle: (vehicleId: string, payload: unknown) => apiClient.post(`/api/reception/vehicles/${vehicleId}/transfer-owner`, payload),
  payments: (params: { search?: string; status?: string }) => apiClient.get<Record<string, unknown>[]>("/api/reception/payments", { params }).then((response) => response.data.map(mapPayment)),
  approvePayment: (paymentId: string, payload: { deliveryDate: string }) => apiClient.post(`/api/reception/payments/${paymentId}/approve`, payload),
  rejectPayment: (paymentId: string, payload: { comment: string }) => apiClient.post(`/api/reception/payments/${paymentId}/reject`, payload),
  documentTypes: () => getPaginated<ApiCatalog>("/api/documenttypes", { pageNumber: 1, pageSize: 100 }).then((page) => page.data.map((item) => ({ id: readId(item), name: `${item.Code ?? item.code ?? ""} ${item.Name ?? item.name ?? ""}`.trim() }))),
  vehicleModels: () => getPaginated<ApiCatalog>("/api/vehiclemodels", { pageNumber: 1, pageSize: 500 }).then((page) => page.data.map((item) => ({ id: readId(item), name: readName(item) }))),
  vehicleTypes: () => getPaginated<ApiCatalog>("/api/vehicletypes", { pageNumber: 1, pageSize: 100 }).then((page) => page.data.map((item) => ({ id: readId(item), name: readName(item) }))),
};
