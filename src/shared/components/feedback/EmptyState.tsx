import { Inbox } from "lucide-react";

export function EmptyState({ title = "Sin registros", description = "No hay información para mostrar." }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
      <Inbox className="h-8 w-8 text-slate-400" />
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
