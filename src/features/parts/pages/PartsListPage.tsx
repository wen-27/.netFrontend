import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { Modal } from "../../../shared/components/ui/Modal";
import { DataTable } from "../../../shared/components/data-table/DataTable";
import { TableToolbar } from "../../../shared/components/data-table/TableToolbar";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { useTableQueryState } from "../../../shared/hooks/useTableQueryState";
import { Part } from "../../../shared/types/domain";
import { formatCurrency } from "../../../shared/utils/formatters";
import { partsService } from "../services/partsService";

function stockStatus(part: Part) {
  if (part.currentStock === 0) return <Badge tone="red">Agotado</Badge>;
  if (part.currentStock <= part.minimumStock) return <Badge tone="amber">Bajo stock</Badge>;
  return <Badge tone="green">Disponible</Badge>;
}

const columns: ColumnDef<Part>[] = [
  { header: "Código", accessorKey: "code", meta: { className: "w-[8%]" } },
  {
    header: "Nombre/descripción",
    meta: { className: "w-[20%]" },
    cell: ({ row }) => <span className="block whitespace-normal break-words leading-snug">{row.original.description}</span>,
  },
  { header: "Categoría", accessorKey: "category", meta: { className: "w-[12%]" } },
  { header: "Marca", accessorKey: "brand", meta: { className: "w-[10%]" } },
  { header: "Stock actual", accessorKey: "currentStock", meta: { className: "w-[8%]" } },
  { header: "Stock mínimo", accessorKey: "minimumStock", meta: { className: "w-[8%]" } },
  { header: "Precio", meta: { className: "w-[10%]" }, cell: ({ row }) => formatCurrency(row.original.price) },
  { header: "Estado stock", meta: { className: "w-[12%]" }, cell: ({ row }) => stockStatus(row.original) },
];

function ProductImagePlaceholder({ part }: { part: Part }) {
  const label = useMemo(() => {
    const text = `${part.description} ${part.category}`.toLowerCase();
    if (text.includes("aceite")) return "Aceite";
    if (text.includes("filtro")) return "Filtro";
    if (text.includes("bater")) return "Batería";
    if (text.includes("freno") || text.includes("pastilla")) return "Frenos";
    return "Repuesto";
  }, [part]);

  return (
    <div className="flex aspect-[4/3] items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-center">
      <div>
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-md bg-white text-blue-700 shadow-sm">
          <Eye className="h-7 w-7" />
        </div>
        <p className="text-sm font-bold text-slate-700">Imagen {label}</p>
      </div>
    </div>
  );
}

export function PartsListPage({ lowStock = false }: { lowStock?: boolean }) {
  const table = useTableQueryState();
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const query = useQuery({ queryKey: ["parts", lowStock, table.page, table.pageSize, table.search], queryFn: () => (lowStock ? partsService.lowStock(table.params) : partsService.list(table.params)) });
  const tableColumns: ColumnDef<Part>[] = [
    ...columns,
    {
      header: "Acciones",
      meta: { className: "w-[12%] text-center" },
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" className="min-h-8 px-2 text-xs" icon={<Eye className="h-4 w-4" />} onClick={() => setSelectedPart(row.original)}>Ver</Button>
          <Button variant="ghost" className="h-8 w-8 px-0" icon={<Pencil className="h-4 w-4" />} onClick={() => location.assign(`/parts/${row.original.id}/edit`)} aria-label="Editar" />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title={lowStock ? "Repuestos bajo stock" : "Inventario de repuestos"} description="Gestión de repuestos, marcas, categorías y disponibilidad." actions={<Button icon={<Plus className="h-4 w-4" />}><Link to="/parts/new">Crear repuesto</Link></Button>} />
      <DataTable data={query.data?.data ?? []} columns={tableColumns} isLoading={query.isLoading} isError={query.isError} error={query.error} totalCount={query.data?.totalCount ?? 0} page={table.page} pageSize={table.pageSize} onPageChange={table.setPage} toolbar={<TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Buscar por código, descripción o marca" />} />
      <Modal open={Boolean(selectedPart)} title="Detalle del producto" onClose={() => setSelectedPart(null)}>
        {selectedPart ? (
          <div className="grid gap-5 md:grid-cols-[220px_1fr]">
            <ProductImagePlaceholder part={selectedPart} />
            <div className="grid gap-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Resumen</p>
                <p className="mt-1 font-semibold text-slate-900">{selectedPart.description}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <p><span className="font-semibold text-slate-600">Código:</span> {selectedPart.code}</p>
                <p><span className="font-semibold text-slate-600">Categoría:</span> {selectedPart.category}</p>
                <p><span className="font-semibold text-slate-600">Marca:</span> {selectedPart.brand}</p>
                <p><span className="font-semibold text-slate-600">Precio:</span> {formatCurrency(selectedPart.price)}</p>
                <p><span className="font-semibold text-slate-600">Stock actual:</span> {selectedPart.currentStock}</p>
                <p><span className="font-semibold text-slate-600">Stock mínimo:</span> {selectedPart.minimumStock}</p>
                <p><span className="font-semibold text-slate-600">Estado:</span> {selectedPart.currentStock <= 0 ? "Agotado" : selectedPart.currentStock <= selectedPart.minimumStock ? "Bajo stock" : "Disponible"}</p>
                <p><span className="font-semibold text-slate-600">Ubicación:</span> Bodega principal</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-slate-600">Últimos movimientos disponibles desde el módulo de bodega.</div>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
