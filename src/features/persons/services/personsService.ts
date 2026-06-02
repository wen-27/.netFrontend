import { apiClient, getPaginated } from "../../../services/apiClient";
import { QueryParams } from "../../../shared/types/common";
import { Person } from "../../../shared/types/domain";
import { RegisterClientRequest } from "../../auth/types/auth.types";

function text(value: unknown, fallback = "") {
  return value === null || value === undefined ? fallback : String(value);
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function mapPerson(item: Record<string, unknown>): Person {
  const firstNames = text(item.firstNames ?? item.FirstNames);
  const lastNames = text(item.lastNames ?? item.LastNames);
  const fullName = text(item.fullName ?? item.FullName, `${firstNames} ${lastNames}`.trim() || "Sin nombre");

  return {
    id: text(item.id ?? item.Id),
    documentType: text(item.documentType ?? item.DocumentType),
    documentNumber: text(item.documentNumber ?? item.DocumentNumber),
    fullName,
    roles: stringArray(item.roles ?? item.Roles),
    primaryEmail: text(item.primaryEmail ?? item.PrimaryEmail, "Sin correo"),
    primaryPhone: text(item.primaryPhone ?? item.PrimaryPhone, "Sin teléfono"),
    vehiclesCount: numberValue(item.vehiclesCount ?? item.VehiclesCount),
    status: text(item.status ?? item.Status, "Activo"),
    role: text(item.role ?? item.Role, "Client"),
    gender: text(item.gender ?? item.Gender, "No registrado"),
    birthDate: text(item.birthDate ?? item.BirthDate),
    address: text(item.address ?? item.Address, "No registrado"),
  };
}

export const personsService = {
  list: (params: QueryParams) => getPaginated<Record<string, unknown>>("/api/admin/clients", params).then((page) => ({ ...page, data: page.data.map(mapPerson) })),
  getById: (id: string) => apiClient.get<Record<string, unknown>>(`/api/admin/clients/${id}`).then((response) => mapPerson(response.data)),
  listVehicles: (id: string) => apiClient.get<Record<string, unknown>[]>(`/api/admin/clients/${id}/vehicles`).then((response) => response.data),
  create: (payload: { firstNames: string; lastNames: string }) => apiClient.post("/api/persons", payload),
  createClient: (payload: RegisterClientRequest) => apiClient.post("/api/auth/register-client", payload),
  update: (id: string, payload: unknown) => apiClient.put(`/api/persons/${id}`, payload),
  remove: (id: string) => apiClient.delete(`/api/persons/${id}`),
  listEmails: (params: QueryParams) => getPaginated("/api/personemails", params, []),
  createEmail: (payload: { personId: number; emailDomainId: number; emailUser: string; isPrimary: boolean }) =>
    apiClient.post("/api/personemails", payload),
  listPhones: (params: QueryParams) => getPaginated("/api/personphones", params, []),
  createPhone: (payload: { personId: number; countryId: number; phoneNumber: string; isPrimary: boolean }) =>
    apiClient.post("/api/personphones", payload),
};
