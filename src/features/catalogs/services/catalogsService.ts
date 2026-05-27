import { getPaginated } from "../../../services/apiClient";
import { QueryParams } from "../../../shared/types/common";

export type CatalogItem = {
  id: string;
  name: string;
  code: string;
  status: string;
};

const mockCatalogs: CatalogItem[] = [
  { id: "1", name: "Toyota", code: "TOY", status: "Activo" },
  { id: "2", name: "Sedán", code: "SED", status: "Activo" },
  { id: "3", name: "Transferencia", code: "BANK", status: "Activo" },
];

export const catalogsService = {
  list: (endpoint: string, params: QueryParams) => getPaginated<CatalogItem>(endpoint, params, mockCatalogs),
};
