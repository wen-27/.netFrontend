import { apiClient, getPaginated, toSearchParams } from "../../../services/apiClient";
import { PaginatedResponse, QueryParams } from "../../../shared/types/common";
import { Part, Purchase } from "../../../shared/types/domain";

function mapPart(item: Record<string, unknown>): Part {
  return {
    id: String(item.id ?? item.Id ?? ""),
    code: String(item.code ?? item.Code ?? ""),
    description: String(item.description ?? item.Description ?? "Repuesto"),
    category: String(item.category ?? item.Category ?? "Sin categoría"),
    brand: String(item.brand ?? item.Brand ?? "Sin marca"),
    currentStock: Number(item.currentStock ?? item.stock ?? item.Stock ?? 0),
    minimumStock: Number(item.minimumStock ?? item.MinimumStock ?? 0),
    price: Number(item.price ?? item.unitPrice ?? item.UnitPrice ?? 0),
  };
}

async function listStockParts(params: QueryParams, stockStatus?: string): Promise<PaginatedResponse<Part>> {
  const page = Math.max(1, Number(params.pageNumber ?? 1));
  const pageSize = Math.max(1, Number(params.pageSize ?? 10));
  const response = await apiClient.get<Record<string, unknown>[]>("/api/stock/parts", {
    params: toSearchParams({ search: params.search, stockStatus }),
  });
  const data = response.data.map(mapPart);
  return {
    data: data.slice((page - 1) * pageSize, page * pageSize),
    totalCount: data.length,
  };
}

export const partsService = {
  list: (params: QueryParams) => listStockParts(params),
  lowStock: (params: QueryParams) => listStockParts(params, "low"),
  purchases: (params: QueryParams) => getPaginated<Purchase>("/api/partpurchases", params),
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
