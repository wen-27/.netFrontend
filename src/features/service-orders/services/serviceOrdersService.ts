import { apiClient, getPaginated } from "../../../services/apiClient";
import { QueryParams } from "../../../shared/types/common";
import { ServiceOrder } from "../../../shared/types/domain";

type ApiServiceOrder = Partial<ServiceOrder> & {
  id?: number | string;
  Id?: number | string;
  vehicleId?: number | string;
  VehicleId?: number | string;
  orderStatusId?: number | string;
  OrderStatusId?: number | string;
  entryDate?: string;
  EntryDate?: string;
  estimatedTotal?: number | string;
  EstimatedTotal?: number | string;
  customer?: string | null;
  Customer?: string | null;
  vehicle?: string | null;
  Vehicle?: string | null;
  status?: string | null;
  Status?: string | null;
  estimatedDeliveryDate?: string;
  EstimatedDeliveryDate?: string;
  workPerformed?: string;
  WorkPerformed?: string;
};

type ApiOrderService = {
  id?: number | string;
  Id?: number | string;
  serviceOrderId?: number | string;
  ServiceOrderId?: number | string;
  serviceTypeId?: number | string;
  ServiceTypeId?: number | string;
  workshopServiceId?: number | string | null;
  WorkshopServiceId?: number | string | null;
  description?: string | null;
  Description?: string | null;
  workPerformed?: string | null;
  WorkPerformed?: string | null;
  laborCost?: number | string;
  LaborCost?: number | string;
  price?: number | string;
  Price?: number | string;
  status?: number | string;
  Status?: number | string;
  customerApproved?: boolean | null;
  CustomerApproved?: boolean | null;
  approvalDate?: string | null;
  ApprovalDate?: string | null;
};

const statusById: Record<string, string> = {
  "1": "Created",
  "2": "PendingAssignment",
  "3": "Assigned",
  "4": "InProgress",
  "5": "PendingClientApproval",
  "6": "WaitingForPayment",
  "7": "PaymentUnderReview",
  "8": "Paid",
  "9": "ReadyForDelivery",
  "10": "Delivered",
  "11": "Cancelled",
};

function toOrderCode(id: string, entryDate?: string) {
  const date = entryDate ? new Date(entryDate) : null;
  const year = date && !Number.isNaN(date.getTime()) ? date.getFullYear() : new Date().getFullYear();
  return `OT-${year}-${id.padStart(4, "0")}`;
}

function normalizeServiceOrder(order: ApiServiceOrder): ServiceOrder {
  const id = String(order.id ?? order.Id ?? "");
  const entryDate = String(order.entryDate ?? order.EntryDate ?? "");
  const statusId = String(order.orderStatusId ?? order.OrderStatusId ?? "");
  return {
    id,
    code: order.code ?? toOrderCode(id, entryDate),
    customer: order.customer ?? order.Customer ?? "Cliente por consultar",
    vehicle: order.vehicle ?? order.Vehicle ?? (order.vehicleId ?? order.VehicleId ? `Vehículo #${order.vehicleId ?? order.VehicleId}` : "Vehículo por consultar"),
    status: order.status ?? order.Status ?? statusById[statusId] ?? "Created",
    mechanic: order.mechanic ?? "Sin asignar",
    entryDate,
    estimatedDelivery: String(order.estimatedDelivery ?? order.estimatedDeliveryDate ?? order.EstimatedDeliveryDate ?? ""),
    estimatedTotal: Number(order.estimatedTotal ?? order.EstimatedTotal ?? 0),
    workPerformed: order.workPerformed ?? order.WorkPerformed,
    generalDescription: order.generalDescription,
    orderServices: order.orderServices,
    additionalRequests: order.additionalRequests,
  };
}

const orderServiceStatusById: Record<string, string> = {
  "1": "Pending",
  "2": "Approved",
  "3": "InProgress",
  "4": "WaitingForParts",
  "5": "Completed",
  "6": "Rejected",
  "7": "Invoiced",
};

function normalizeOrderService(service: ApiOrderService) {
  const id = String(service.id ?? service.Id ?? "");
  const description = String(service.description ?? service.Description ?? "").trim();
  const workshopServiceId = service.workshopServiceId ?? service.WorkshopServiceId;
  const serviceTypeId = service.serviceTypeId ?? service.ServiceTypeId;
  const status = String(service.status ?? service.Status ?? "");
  return {
    id,
    serviceOrderId: String(service.serviceOrderId ?? service.ServiceOrderId ?? ""),
    name: description || (workshopServiceId ? `Servicio de taller #${workshopServiceId}` : `Servicio #${serviceTypeId ?? id}`),
    status: orderServiceStatusById[status] ?? (status || "Pending"),
    workPerformed: String(service.workPerformed ?? service.WorkPerformed ?? ""),
    laborCost: Number(service.laborCost ?? service.LaborCost ?? 0),
    price: Number(service.price ?? service.Price ?? 0),
    total: Number(service.price ?? service.Price ?? 0) + Number(service.laborCost ?? service.LaborCost ?? 0),
    customerApproved: service.customerApproved ?? service.CustomerApproved,
    approvalDate: service.approvalDate ?? service.ApprovalDate,
  };
}

export const serviceOrdersService = {
  list: async (params: QueryParams) => {
    const result = await getPaginated<ApiServiceOrder>("/api/serviceorders", params);
    return {
      ...result,
      data: result.data.map(normalizeServiceOrder),
    };
  },
  getById: async (id: string) => {
    const response = await apiClient.get<ApiServiceOrder>(`/api/serviceorders/${id}`);
    return normalizeServiceOrder(response.data);
  },
  create: (payload: { vehicleId: number; orderStatusId: number; estimatedDeliveryDate?: string | null; generalDescription?: string | null }) =>
    apiClient.post("/api/serviceorders", payload),
  createEmpty: async (payload: { clientPersonId: number; vehicleId: number }) => {
    try {
      return await apiClient.post("/api/serviceorders/empty", payload);
    } catch (error) {
      if ((error as { status?: number }).status !== 405) throw error;
      return apiClient.post("/api/serviceorders", {
        vehicleId: payload.vehicleId,
        orderStatusId: 1,
        estimatedDeliveryDate: null,
        generalDescription: null,
      });
    }
  },
  createDiagnostic: (payload: {
    clientPersonId: number;
    vehicleId: number;
    entryDate: string;
    mileage: number;
    problemDescription: string;
    observations: string;
    estimatedDeliveryDate: string;
    checklist: {
      lights: boolean;
      tires: boolean;
      mirrors: boolean;
      documents: boolean;
      tools: boolean;
      scratchesOrDents: boolean;
      fuelLevel: string;
      objectsInsideVehicle: string;
      notes?: string;
    };
    serviceAssignment: {
      serviceTypeId: number;
      specialtyId: number;
      mechanicPersonId: number;
      observation: string;
      laborCost: number;
    };
  }) => apiClient.post("/api/serviceorders/diagnostic", payload),
  registerWork: (id: string, payload: { workPerformed: string }) => apiClient.post(`/api/mechanic/orders/${id}/work`, payload),
  changeStatus: (id: string, payload: { orderStatusId: number; userId: number; observation: string }) =>
    apiClient.patch(`/api/serviceorders/${id}/status`, payload),
  listOrderServices: (params: QueryParams) => getPaginated<ApiOrderService>("/api/orderservices", params, []),
  listOrderServicesByOrder: async (orderId: string) => {
    const response = await apiClient.get<ApiOrderService[]>(`/api/orderservices/by-order/${orderId}`);
    return response.data.map(normalizeOrderService);
  },
  assignMechanic: (payload: { orderServiceId: number; mechanicPersonId: number; specialtyId: number }) =>
    apiClient.post("/api/mechanicassignments", payload),
};
