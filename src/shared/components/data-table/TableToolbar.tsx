import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/Button";

type TableToolbarProps = {
  search: string;
  placeholder?: string;
  onSearchChange: (value: string) => void;
  children?: React.ReactNode;
};

export function TableToolbar({ search, placeholder = "Buscar...", onSearchChange, children }: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
      <label className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <Button variant="secondary" icon={<SlidersHorizontal className="h-4 w-4" />}>Filtros</Button>
      </div>
    </div>
  );
}
