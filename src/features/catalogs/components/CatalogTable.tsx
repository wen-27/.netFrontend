import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../../shared/components/ui/Badge";
import { DataTable } from "../../../shared/components/data-table/DataTable";
import { TableToolbar } from "../../../shared/components/data-table/TableToolbar";
import { useTableQueryState } from "../../../shared/hooks/useTableQueryState";
import { CatalogItem, catalogsService } from "../services/catalogsService";

const columns: ColumnDef<CatalogItem>[] = [
  { header: "Código", accessorKey: "code" },
  { header: "Nombre", accessorKey: "name" },
  { header: "Estado", cell: ({ row }) => <Badge tone="green">{row.original.status}</Badge> },
];

export function CatalogTable({ endpoint }: { endpoint: string }) {
  const table = useTableQueryState();
  const query = useQuery({ queryKey: ["catalogs", endpoint, table.page, table.pageSize, table.search], queryFn: () => catalogsService.list(endpoint, table.params) });
  return <DataTable data={query.data?.data ?? []} columns={columns} isLoading={query.isLoading} isError={query.isError} totalCount={query.data?.totalCount ?? 0} page={table.page} pageSize={table.pageSize} onPageChange={table.setPage} toolbar={<TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Buscar catálogo" />} />;
}
