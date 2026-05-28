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
  estimatedDeliveryDate?: string;
  EstimatedDeliveryDate?: string;
  workPerformed?: string;
  WorkPerformed?: string;
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
    customer: order.customer ?? "Cliente por consultar",
    vehicle: order.vehicle ?? (order.vehicleId ?? order.VehicleId ? `Vehículo #${order.vehicleId ?? order.VehicleId}` : "Vehículo por consultar"),
    status: order.status ?? statusById[statusId] ?? "Created",
    mechanic: order.mechanic ?? "Sin asignar",
    entryDate,
    estimatedDelivery: String(order.estimatedDelivery ?? order.estimatedDeliveryDate ?? order.EstimatedDeliveryDate ?? ""),
    estimatedTotal: Number(order.estimatedTotal ?? 0),
    workPerformed: order.workPerformed ?? order.WorkPerformed,
    generalDescription: order.generalDescription,
    orderServices: order.orderServices,
    additionalRequests: order.additionalRequests,
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
  getById: (id: string) => apiClient.get(`/api/serviceorders/${id}`),
  create: (payload: { vehicleId: number; orderStatusId: number; estimatedDeliveryDate: string; generalDescription: string }) =>
    apiClient.post("/api/serviceorders", payload),
  registerWork: (id: string, payload: { workPerformed: string }) => apiClient.post(`/api/mechanic/orders/${id}/work`, payload),
  changeStatus: (id: string, payload: { orderStatusId: number; userId: number; observation: string }) =>
    apiClient.patch(`/api/serviceorders/${id}/status`, payload),
  listOrderServices: (params: QueryParams) => getPaginated("/api/orderservices", params, []),
  assignMechanic: (payload: { orderServiceId: number; mechanicPersonId: number; specialtyId: number }) =>
    apiClient.post("/api/mechanicassignments", payload),
};
