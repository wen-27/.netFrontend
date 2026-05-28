import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { DataTable } from "../../../shared/components/data-table/DataTable";
import { TableToolbar } from "../../../shared/components/data-table/TableToolbar";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { useTableQueryState } from "../../../shared/hooks/useTableQueryState";
import { Purchase } from "../../../shared/types/domain";
import { formatCurrency, formatDate } from "../../../shared/utils/formatters";
import { partsService } from "../services/partsService";

const columns: ColumnDef<Purchase>[] = [
  { header: "Número", accessorKey: "number" },
  { header: "Proveedor", accessorKey: "supplier" },
  { header: "Fecha", cell: ({ row }) => formatDate(row.original.date) },
  { header: "Total", cell: ({ row }) => formatCurrency(row.original.total) },
  { header: "Estado", cell: ({ row }) => <Badge tone={row.original.status === "Recibida" ? "green" : "amber"}>{row.original.status}</Badge> },
  { header: "Acciones", cell: ({ row }) => <Button variant="ghost" className="h-8 w-8 px-0" icon={<Eye className="h-4 w-4" />} onClick={() => location.assign(`/part-purchases/${row.original.id}`)} aria-label="Ver" /> },
];

export function PartPurchasesListPage() {
  const table = useTableQueryState();
  const query = useQuery({ queryKey: ["part-purchases", table.page, table.pageSize, table.search], queryFn: () => partsService.purchases(table.params) });
  return (
    <>
      <PageHeader title="Compras de repuestos" description="Órdenes de compra, recepción y detalle de inventario." actions={<Button icon={<Plus className="h-4 w-4" />}><Link to="/part-purchases/new">Nueva compra</Link></Button>} />
      <DataTable data={query.data?.data ?? []} columns={columns} isLoading={query.isLoading} isError={query.isError} error={query.error} totalCount={query.data?.totalCount ?? 0} page={table.page} pageSize={table.pageSize} onPageChange={table.setPage} toolbar={<TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Buscar por número o proveedor" />} />
    </>
  );
}
