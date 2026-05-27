import { apiClient, getPaginated } from "../../../services/apiClient";
import { QueryParams } from "../../../shared/types/common";
import { Person } from "../../../shared/types/domain";
import { mockPersons } from "../../../shared/utils/mockData";

export const personsService = {
  list: (params: QueryParams) => getPaginated<Person>("/api/persons", params, mockPersons),
  getById: (id: string) => apiClient.get(`/api/persons/${id}`),
  create: (payload: { firstNames: string; lastNames: string }) => apiClient.post("/api/persons", payload),
  update: (id: string, payload: unknown) => apiClient.put(`/api/persons/${id}`, payload),
  remove: (id: string) => apiClient.delete(`/api/persons/${id}`),
  listEmails: (params: QueryParams) => getPaginated("/api/personemails", params, []),
  createEmail: (payload: { personId: number; emailDomainId: number; emailUser: string; isPrimary: boolean }) =>
    apiClient.post("/api/personemails", payload),
  listPhones: (params: QueryParams) => getPaginated("/api/personphones", params, []),
  createPhone: (payload: { personId: number; countryId: number; phoneNumber: string; isPrimary: boolean }) =>
    apiClient.post("/api/personphones", payload),
};
