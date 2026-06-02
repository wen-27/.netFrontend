import { apiClient, getPaginated } from "../../../services/apiClient";
import { QueryParams } from "../../../shared/types/common";
import { UserAccount } from "../../../shared/types/domain";

export type AdminUserCreatePayload = {
  documentTypeId: number;
  documentNumber: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  secondLastName?: string | null;
  email: string;
  phone?: string | null;
  phoneCountryId?: number | null;
  password: string;
  roleId: number;
  mechanicSpecialtyId?: number | null;
  isActive: boolean;
};

export type CatalogOption = {
  id: string;
  name: string;
};

function mapUser(item: Record<string, unknown>): UserAccount {
  const rawRoles = item.roles ?? item.Roles;
  const roles = Array.isArray(rawRoles)
    ? rawRoles.map(String)
    : item.role || item.Role
      ? [String(item.role ?? item.Role)]
      : [];
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? item.Name ?? ""),
    email: String(item.email ?? item.Email ?? ""),
    roles,
    status: String(item.status ?? item.Status ?? "Activo"),
    lastAccess: String(item.lastAccess ?? item.LastAccess ?? item.createdAt ?? item.CreatedAt ?? ""),
  };
}

function mapCatalogOption(item: Record<string, unknown>): CatalogOption {
  return {
    id: String(item.id ?? item.Id ?? ""),
    name: String(item.name ?? item.Name ?? item.roleName ?? item.RoleName ?? ""),
  };
}

export const usersService = {
  list: (params: QueryParams) =>
    getPaginated<Record<string, unknown>>("/api/admin/users", params).then((page) => ({ ...page, data: page.data.map(mapUser) })),
  getById: (id: string) => apiClient.get(`/api/users/${id}`),
  create: (payload: AdminUserCreatePayload) => apiClient.post("/api/admin/users", payload),
  updateStatus: (id: string, payload: { isActive: boolean }) => apiClient.patch(`/api/admin/users/${id}/status`, payload),
  updateRoles: (id: string, payload: { roleNames: string[] }) => apiClient.put(`/api/admin/users/${id}/roles`, payload),
  listRoles: (params: QueryParams) =>
    getPaginated<Record<string, unknown>>("/api/roles", params, []).then((page) => ({ ...page, data: page.data.map(mapCatalogOption) })),
  listDocumentTypes: () =>
    getPaginated<Record<string, unknown>>("/api/documenttypes", { pageNumber: 1, pageSize: 100 }, []).then((page) => page.data.map((item) => ({
      id: String(item.id ?? item.Id ?? ""),
      name: `${item.code ?? item.Code ?? ""} ${item.name ?? item.Name ?? ""}`.trim(),
    }))),
  listMechanicSpecialties: () =>
    apiClient.get<Record<string, unknown>[]>("/api/mechanics-catalog/specialties").then((response) => response.data.map(mapCatalogOption)),
  createRole: (payload: { roleName: string }) => apiClient.post("/api/roles", payload),
  assignRole: (payload: { userId: number; roleId: number }) => apiClient.post("/api/userroles", payload),
  removeRole: (userId: number, roleId: number) => apiClient.delete("/api/userroles", { params: { userId, roleId } }),
};
