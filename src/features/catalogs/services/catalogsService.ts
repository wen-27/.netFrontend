import { getPaginated } from "../../../services/apiClient";
import { QueryParams } from "../../../shared/types/common";

export type CatalogItem = {
  id: string;
  name: string;
  code: string;
  status: string;
};

export const catalogsService = {
  list: (endpoint: string, params: QueryParams) => getPaginated<CatalogItem>(endpoint, params),
};
