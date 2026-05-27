import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Cargando información..." }: { label?: string }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-200 bg-white p-8 text-slate-500">
      <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
