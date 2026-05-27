import { apiClient, getPaginated } from "../../../services/apiClient";
import { QueryParams } from "../../../shared/types/common";
import { Vehicle } from "../../../shared/types/domain";
import { mockVehicles } from "../../../shared/utils/mockData";

export const vehiclesService = {
  list: (params: QueryParams) => getPaginated<Vehicle>("/api/vehicles", params, mockVehicles),
  getById: (id: string) => apiClient.get(`/api/vehicles/${id}`),
  create: (payload: { modelId: number; vehicleTypeId: number; vin: string; year: number; color: string; mileage: number; isActive: boolean }) =>
    apiClient.post("/api/vehicles", payload),
  update: (id: string, payload: unknown) => apiClient.put(`/api/vehicles/${id}`, payload),
  remove: (id: string) => apiClient.delete(`/api/vehicles/${id}`),
  listOwnerHistory: (params: QueryParams) => getPaginated("/api/vehicleownerhistory", params, []),
  createOwnerHistory: (payload: { vehicleId: number; personId: number; startDate: string }) => apiClient.post("/api/vehicleownerhistory", payload),
  endOwnerHistory: (vehicleId: number, payload: { endDate: string }) => apiClient.patch(`/api/vehicleownerhistory/${vehicleId}/end`, payload),
};
