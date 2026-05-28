import { apiClient, getPaginated } from "../../../services/apiClient";
import { QueryParams } from "../../../shared/types/common";
import { ServiceOrder } from "../../../shared/types/domain";
import { mockServiceOrders } from "../../../shared/utils/mockData";

export const serviceOrdersService = {
  list: (params: QueryParams) => getPaginated<ServiceOrder>("/api/serviceorders", params, mockServiceOrders),
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
