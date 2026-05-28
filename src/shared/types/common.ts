export type Role =
  | "Admin"
  | "Receptionist"
  | "Mechanic"
  | "Client"
  | "WorkshopChief"
  | "WarehouseChief"
  | "InventoryManager";

export type PaginatedResponse<T> = {
  data: T[];
  totalCount: number;
};

export type QueryParams = {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
};

export type SelectOption = {
  label: string;
  value: string;
};

export type ApiError = {
  message: string;
  status?: number;
  details?: unknown;
};

export const rolePriority: Role[] = [
  "Admin",
  "WorkshopChief",
  "InventoryManager",
  "WarehouseChief",
  "Receptionist",
  "Mechanic",
  "Client",
];

export const roleLabels: Record<Role, string> = {
  Admin: "Administrador",
  Receptionist: "Recepción",
  Mechanic: "Mecánico",
  Client: "Cliente",
  WorkshopChief: "Jefe de taller",
  WarehouseChief: "Jefe de bodega",
  InventoryManager: "Jefe de almacén",
};
