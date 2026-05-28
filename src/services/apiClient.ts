import axios, { AxiosError, AxiosResponse } from "axios";
import { PaginatedResponse, QueryParams } from "../shared/types/common";
import { tokenStorage } from "./tokenStorage";
import { getStatusName } from "../shared/utils/apiErrors";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.clearToken();
      if (!window.location.pathname.includes("/auth/session-expired")) {
        window.location.href = "/auth/session-expired";
      }
    }

    const details = error.response?.data;
    const message =
      (typeof details === "string" ? details : undefined) ??
      (details as { message?: string } | undefined)?.message ??
      (details as { title?: string } | undefined)?.title ??
      error.message ??
      "No fue posible completar la solicitud.";
    const status = error.response?.status;
    const statusText = getStatusName(status, error.response?.statusText);

    return Promise.reject({
      name: statusText,
      message:
        message,
      status,
      statusText,
      details,
    });
  },
);

export function getTotalCount(response: AxiosResponse) {
  const value = response.headers["x-total-count"] ?? response.headers["X-Total-Count"];
  const total = Number(value);
  return Number.isFinite(total) ? total : 0;
}

export function toSearchParams(params: QueryParams = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
  );
}

export async function getPaginated<T>(
  endpoint: string,
  params: QueryParams,
  _fallback: T[] = [],
): Promise<PaginatedResponse<T>> {
  const response = await apiClient.get<T[] | { items?: T[]; Items?: T[]; totalCount?: number; TotalCount?: number }>(endpoint, { params: toSearchParams(params) });
  const data = Array.isArray(response.data) ? response.data : response.data.items ?? response.data.Items ?? [];
  const totalCount = Array.isArray(response.data) ? undefined : response.data.totalCount ?? response.data.TotalCount;
  return {
    data,
    totalCount: getTotalCount(response) || totalCount || data.length,
  };
}
