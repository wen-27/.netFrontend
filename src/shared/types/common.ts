export type Role = "Admin" | "Receptionist" | "Mechanic" | "Client";

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

export const rolePriority: Role[] = ["Admin", "Receptionist", "Mechanic", "Client"];
