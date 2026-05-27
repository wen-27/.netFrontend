import { apiClient, getPaginated } from "../../../services/apiClient";
import { QueryParams } from "../../../shared/types/common";
import { Part, Purchase } from "../../../shared/types/domain";
import { mockParts, mockPurchases } from "../../../shared/utils/mockData";

export const partsService = {
  list: (params: QueryParams) => getPaginated<Part>("/api/parts", params, mockParts),
  lowStock: (params: QueryParams) => getPaginated<Part>("/api/parts", { ...params, lowStock: true }, mockParts.filter((part) => part.currentStock <= part.minimumStock)),
  purchases: (params: QueryParams) => getPaginated<Purchase>("/api/partpurchases", params, mockPurchases),
  getById: (id: string) => apiClient.get(`/api/parts/${id}`),
  create: (payload: { partCategoryId: number; partBrandId: number | null; code: string; description: string; stock: number; minimumStock: number; unitPrice: number; isActive: boolean }) =>
    apiClient.post("/api/parts", payload),
  update: (id: string, payload: unknown) => apiClient.put(`/api/parts/${id}`, payload),
  listOrderServiceParts: (params: QueryParams) => getPaginated("/api/orderserviceparts", params, []),
  createOrderServicePart: (payload: { orderServiceId: number; partId: number; quantity: number; appliedUnitPrice: number }) =>
    apiClient.post("/api/orderserviceparts", payload),
  updateOrderServicePart: (id: string, payload: { quantity: number; appliedUnitPrice: number; customerApproved: boolean; approvalDate: string }) =>
    apiClient.put(`/api/orderserviceparts/${id}`, payload),
};
