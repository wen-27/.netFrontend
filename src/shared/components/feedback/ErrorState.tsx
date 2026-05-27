import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";

export function ErrorState({ message = "Ocurrió un error al cargar los datos.", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-lg border border-red-100 bg-red-50 p-8 text-center text-red-700">
      <AlertTriangle className="h-8 w-8" />
      <p className="text-sm font-semibold">{message}</p>
      {onRetry ? <Button variant="secondary" onClick={onRetry}>Reintentar</Button> : null}
    </div>
  );
}
