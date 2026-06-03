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
  testRateLimit: async () => {
    const attempts = Array.from({ length: 6 }, async (_, index) => {
      const response = await apiClient.get("/api/parts", {
        params: { pageNumber: 1, pageSize: 1 },
        validateStatus: () => true,
      });

      return {
        attempt: index + 1,
        status: response.status,
      };
    });

    return Promise.all(attempts);
  },
  purchases: (params: QueryParams) => getPaginated<Purchase>("/api/partpurchases", params),
  getById: (id: string) => apiClient.get(`/api/parts/${id}`),
  inventoryProducts: () => apiClient.get<Record<string, unknown>[]>("/api/inventory/products").then((response) => response.data),
  inventoryProduct: async (id: string) => {
    const response = await apiClient.get<Record<string, unknown>[]>("/api/inventory/products");
    const item = response.data.find((product) => String(product.id ?? product.Id) === id);
    if (!item) throw new Error("El repuesto no existe.");
    return item;
  },
  categories: () => apiClient.get<Record<string, unknown>[]>("/api/inventory/categories").then((response) => response.data),
  brands: () => apiClient.get<Record<string, unknown>[]>("/api/inventory/brands").then((response) => response.data),
  create: (payload: { partCategoryId: number; partBrandId: number | null; code: string; description: string; minimumStock: number; unitPrice: number; isActive: boolean }) =>
    apiClient.post("/api/inventory/products", payload),
  update: (id: string, payload: { partCategoryId: number; partBrandId: number | null; code: string; description: string; minimumStock: number; unitPrice: number; isActive: boolean }) =>
    apiClient.put(`/api/inventory/products/${id}`, payload),
  listOrderServiceParts: (params: QueryParams) => getPaginated("/api/orderserviceparts", params, []),
  createOrderServicePart: (payload: { orderServiceId: number; partId: number; quantity: number; appliedUnitPrice: number }) =>
    apiClient.post("/api/orderserviceparts", payload),
  updateOrderServicePart: (id: string, payload: { quantity: number; appliedUnitPrice: number; customerApproved: boolean; approvalDate: string }) =>
    apiClient.put(`/api/orderserviceparts/${id}`, payload),
};
