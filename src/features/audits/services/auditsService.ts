import { apiClient, getPaginated } from "../../../services/apiClient";
import { QueryParams } from "../../../shared/types/common";
import { AuditEvent } from "../../../shared/types/domain";
import { mockAudits } from "../../../shared/utils/mockData";

export const auditsService = {
  list: (params: QueryParams) => getPaginated<AuditEvent>("/api/audits", params, mockAudits),
  getById: (id: string) => apiClient.get(`/api/audits/${id}`),
  create: (payload: { userId: number; auditActionTypeId: number; affectedEntity: string; affectedRecordId: number; description: string }) =>
    apiClient.post("/api/audits", payload),
  listActionTypes: (params: QueryParams) => getPaginated("/api/auditactiontypes", params, []),
};
