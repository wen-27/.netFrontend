import { ApiError } from "../types/common";

const statusNames: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

function detailsSummary(details: unknown): string | undefined {
  if (typeof details === "string" && details.trim()) return details;
  if (!details || typeof details !== "object") return undefined;
  const data = details as Record<string, unknown>;
  if (typeof data.title === "string") return data.title;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.error === "string") return data.error;
  if (data.errors && typeof data.errors === "object") {
    const first = Object.values(data.errors as Record<string, unknown>)[0];
    if (Array.isArray(first)) return first.join(" ");
    if (typeof first === "string") return first;
  }
  return undefined;
}

export function getStatusName(status?: number, statusText?: string) {
  if (statusText && statusText.trim()) return statusText;
  if (status && statusNames[status]) return statusNames[status];
  return status ? "HTTP Error" : "Error de conexión";
}

export function toApiError(error: unknown): ApiError {
  if (error && typeof error === "object") {
    const value = error as ApiError;
    const statusName = getStatusName(value.status, value.statusText ?? value.name);
    return {
      ...value,
      name: value.name ?? statusName,
      statusText: value.statusText ?? statusName,
      summary: value.summary ?? detailsSummary(value.details),
      message: value.message || "No fue posible completar la solicitud.",
    };
  }

  return {
    message: "No fue posible completar la solicitud.",
    name: "Error de conexión",
    statusText: "Error de conexión",
  };
}

export function formatApiError(error: unknown, action = "No se pudo completar la solicitud") {
  const apiError = toApiError(error);
  const status = apiError.status ? `Error ${apiError.status} (${apiError.statusText})` : apiError.statusText;
  const summary = apiError.summary ? ` ${apiError.summary}` : "";
  return `${action}. ${status}: ${apiError.message}.${summary}`;
}
