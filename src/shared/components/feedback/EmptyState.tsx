import { ClipboardList, Wrench } from "lucide-react";

export function EmptyState({ title = "Sin registros", description = "No hay información para mostrar." }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
      <span className="relative flex h-12 w-12 items-center justify-center rounded-md bg-slate-950 text-amber-300 ring-1 ring-slate-800">
        <ClipboardList className="h-6 w-6" />
        <Wrench className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-amber-300 p-0.5 text-slate-950" />
      </span>
      <div>
        <p className="font-black text-slate-900">{title}</p>
        <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
      </div>
    </div>
  );
}
