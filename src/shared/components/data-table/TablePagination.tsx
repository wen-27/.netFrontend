import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/Button";

type TablePaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export function TablePagination({ page, pageSize, totalCount, onPageChange }: TablePaginationProps) {
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);
  const canPrevious = page > 1;
  const canNext = to < totalCount;

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Mostrando {from}-{to} de {totalCount} registros
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" className="h-9 px-3" disabled={!canPrevious} onClick={() => onPageChange(page - 1)} icon={<ChevronLeft className="h-4 w-4" />}>
          Anterior
        </Button>
        <Button variant="secondary" className="h-9 px-3" disabled={!canNext} onClick={() => onPageChange(page + 1)} icon={<ChevronRight className="h-4 w-4" />}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
