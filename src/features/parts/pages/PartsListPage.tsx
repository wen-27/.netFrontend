import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
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
  { header: "Código", accessorKey: "code" },
  { header: "Nombre/descripción", accessorKey: "description" },
  { header: "Categoría", accessorKey: "category" },
  { header: "Marca", accessorKey: "brand" },
  { header: "Stock actual", accessorKey: "currentStock" },
  { header: "Stock mínimo", accessorKey: "minimumStock" },
  { header: "Precio", cell: ({ row }) => formatCurrency(row.original.price) },
  { header: "Estado stock", cell: ({ row }) => stockStatus(row.original) },
  { header: "Acciones", cell: ({ row }) => <Button variant="ghost" className="h-8 w-8 px-0" icon={<Pencil className="h-4 w-4" />} onClick={() => location.assign(`/parts/${row.original.id}/edit`)} aria-label="Editar" /> },
];

export function PartsListPage({ lowStock = false }: { lowStock?: boolean }) {
  const table = useTableQueryState();
  const query = useQuery({ queryKey: ["parts", lowStock, table.page, table.pageSize, table.search], queryFn: () => (lowStock ? partsService.lowStock(table.params) : partsService.list(table.params)) });

  return (
    <>
      <PageHeader title={lowStock ? "Repuestos bajo stock" : "Inventario de repuestos"} description="Gestión de repuestos, marcas, categorías y disponibilidad." actions={<Button icon={<Plus className="h-4 w-4" />}><Link to="/parts/new">Crear repuesto</Link></Button>} />
      <DataTable data={query.data?.data ?? []} columns={columns} isLoading={query.isLoading} isError={query.isError} error={query.error} totalCount={query.data?.totalCount ?? 0} page={table.page} pageSize={table.pageSize} onPageChange={table.setPage} toolbar={<TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Buscar por código, descripción o marca" />} />
    </>
  );
}
