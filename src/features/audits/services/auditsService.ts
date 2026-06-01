import { apiClient, getPaginated } from "../../../services/apiClient";
import { QueryParams } from "../../../shared/types/common";
import { AuditEvent } from "../../../shared/types/domain";

function mapAudit(item: Record<string, unknown>): AuditEvent {
  const entity = String(item.affectedEntity ?? item.AffectedEntity ?? item.entity ?? item.Entity ?? "");
  const entityId = String(item.affectedRecordId ?? item.AffectedRecordId ?? item.entityId ?? item.EntityId ?? "");
  return {
    id: String(item.id ?? item.Id ?? ""),
    date: String(item.createdAt ?? item.CreatedAt ?? item.date ?? item.Date ?? ""),
    user: String(item.user ?? item.User ?? `Usuario #${item.userId ?? item.UserId ?? ""}`).trim(),
    action: String(item.action ?? item.Action ?? `Acción #${item.auditActionTypeId ?? item.AuditActionTypeId ?? ""}`).trim(),
    entity: entity || "Sin entidad",
    entityId: entityId || "Sin ID",
    origin: String(item.origin ?? item.Origin ?? item.description ?? item.Description ?? "Sistema"),
  };
}

export const auditsService = {
  list: (params: QueryParams) =>
    getPaginated<Record<string, unknown>>("/api/audits", params).then((page) => ({ ...page, data: page.data.map(mapAudit) })),
  getById: (id: string) => apiClient.get(`/api/audits/${id}`),
  create: (payload: { userId: number; auditActionTypeId: number; affectedEntity: string; affectedRecordId: number; description: string }) =>
    apiClient.post("/api/audits", payload),
  listActionTypes: (params: QueryParams) => getPaginated("/api/auditactiontypes", params, []),
};
