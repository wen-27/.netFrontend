import { AlertTriangle } from "lucide-react";
import { Card } from "../ui/Card";
import { formatApiError, toApiError } from "../../utils/apiErrors";

type ApiErrorAlertProps = {
  error: unknown;
  action?: string;
  className?: string;
};

export function ApiErrorAlert({ error, action = "No se pudo cargar la información", className }: ApiErrorAlertProps) {
  const apiError = toApiError(error);
  return (
    <Card className={`border-red-200 bg-red-50 p-4 text-red-800 ${className ?? ""}`}>
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1 text-sm">
          <p className="font-bold">{formatApiError(apiError, action)}</p>
          {apiError.status ? <p>Código: {apiError.status} · Nombre: {apiError.statusText}</p> : null}
          {apiError.summary ? <p>Detalle: {apiError.summary}</p> : null}
        </div>
      </div>
    </Card>
  );
}
