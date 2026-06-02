import { getPaginated } from "../../../services/apiClient";
import { QueryParams } from "../../../shared/types/common";

export type CatalogItem = {
  id: string;
  name: string;
  code: string;
  status: string;
};

function text(value: unknown, fallback = "") {
  return value === null || value === undefined ? fallback : String(value);
}

function toCode(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function mapCatalogItem(item: Record<string, unknown>): CatalogItem {
  const name =
    text(item.name ?? item.Name) ||
    text(item.roleName ?? item.RoleName) ||
    text(item.brandName ?? item.BrandName) ||
    text(item.modelName ?? item.ModelName) ||
    text(item.domain ?? item.Domain) ||
    text(item.code ?? item.Code, "Sin nombre");

  return {
    id: text(item.id ?? item.Id),
    code: text(item.code ?? item.Code, toCode(name)),
    name,
    status: text(item.status ?? item.Status ?? item.isActive ?? item.IsActive, "Activo") === "false" ? "Inactivo" : "Activo",
  };
}

export const catalogsService = {
  list: (endpoint: string, params: QueryParams) =>
    getPaginated<Record<string, unknown>>(endpoint, params).then((page) => ({ ...page, data: page.data.map(mapCatalogItem) })),
};
