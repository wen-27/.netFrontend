import axios, { AxiosError, AxiosResponse } from "axios";
import { PaginatedResponse, QueryParams } from "../shared/types/common";
import { tokenStorage } from "./tokenStorage";

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

    return Promise.reject({
      message:
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message ??
        "No fue posible completar la solicitud.",
      status: error.response?.status,
      details: error.response?.data,
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
  fallback: T[],
): Promise<PaginatedResponse<T>> {
  try {
    const response = await apiClient.get<T[]>(endpoint, { params: toSearchParams(params) });
    return {
      data: response.data,
      totalCount: getTotalCount(response) || response.data.length,
    };
  } catch (error) {
    if ((error as { status?: number }).status === 401) throw error;
    return { data: fallback, totalCount: fallback.length };
  }
}
