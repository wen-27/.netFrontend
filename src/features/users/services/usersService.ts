import { apiClient, getPaginated } from "../../../services/apiClient";
import { QueryParams } from "../../../shared/types/common";
import { UserAccount } from "../../../shared/types/domain";

export const usersService = {
  list: (params: QueryParams) => getPaginated<UserAccount>("/api/users", params),
  getById: (id: string) => apiClient.get(`/api/users/${id}`),
  create: (payload: { personId: number; passwordHash: string }) => apiClient.post("/api/users", payload),
  updateStatus: (id: string, payload: { status: boolean }) => apiClient.patch(`/api/users/${id}/status`, payload),
  listRoles: (params: QueryParams) => getPaginated("/api/roles", params, []),
  createRole: (payload: { roleName: string }) => apiClient.post("/api/roles", payload),
  assignRole: (payload: { userId: number; roleId: number }) => apiClient.post("/api/userroles", payload),
  removeRole: (userId: number, roleId: number) => apiClient.delete("/api/userroles", { params: { userId, roleId } }),
};
