import { apiClient, getPaginated, getTotalCount, toSearchParams } from "../../../services/apiClient";
import { PaginatedResponse, QueryParams } from "../../../shared/types/common";
import { Vehicle } from "../../../shared/types/domain";

function mapVehicle(item: Record<string, unknown>): Vehicle {
  return {
    id: String(item.id ?? item.Id ?? ""),
    vin: String(item.vin ?? item.Vin ?? ""),
    brand: String(item.brand ?? item.Brand ?? "Sin marca"),
    model: String(item.model ?? item.Model ?? "Sin modelo"),
    type: String(item.type ?? item.Type ?? "Sin tipo"),
    year: Number(item.year ?? item.Year ?? 0),
    mileage: Number(item.mileage ?? item.Mileage ?? 0),
    currentOwner: String(item.currentOwner ?? item.CurrentOwner ?? "Sin propietario"),
    activeOrders: Number(item.activeOrders ?? item.ActiveOrders ?? 0),
  };
}

export const vehiclesService = {
  list: async (params: QueryParams): Promise<PaginatedResponse<Vehicle>> => {
    const response = await apiClient.get<Record<string, unknown>[]>("/api/reception/vehicles", { params: toSearchParams(params) });
    return {
      data: response.data.map(mapVehicle),
      totalCount: getTotalCount(response) || response.data.length,
    };
  },
  getById: (id: string) => apiClient.get(`/api/vehicles/${id}`),
  create: (payload: { modelId: number; vehicleTypeId: number; vin: string; year: number; color: string; mileage: number; isActive: boolean }) =>
    apiClient.post("/api/vehicles", payload),
  update: (id: string, payload: unknown) => apiClient.put(`/api/vehicles/${id}`, payload),
  remove: (id: string) => apiClient.delete(`/api/vehicles/${id}`),
  listOwnerHistory: (params: QueryParams) => getPaginated("/api/vehicleownerhistory", params, []),
  createOwnerHistory: (payload: { vehicleId: number; personId: number; startDate: string }) => apiClient.post("/api/vehicleownerhistory", payload),
  endOwnerHistory: (vehicleId: number, payload: { endDate: string }) => apiClient.patch(`/api/vehicleownerhistory/${vehicleId}/end`, payload),
};
