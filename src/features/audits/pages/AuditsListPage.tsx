import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { DataTable } from "../../../shared/components/data-table/DataTable";
import { TableToolbar } from "../../../shared/components/data-table/TableToolbar";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { useTableQueryState } from "../../../shared/hooks/useTableQueryState";
import { AuditEvent } from "../../../shared/types/domain";
import { formatDateTime } from "../../../shared/utils/formatters";
import { auditsService } from "../services/auditsService";
import { AuditDetailDrawer } from "../components/AuditDetailDrawer";

export function AuditsListPage() {
  const table = useTableQueryState();
  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const query = useQuery({ queryKey: ["audits", table.page, table.pageSize, table.search], queryFn: () => auditsService.list(table.params) });
  const columns: ColumnDef<AuditEvent>[] = [
    { header: "Fecha", cell: ({ row }) => formatDateTime(row.original.date) },
    { header: "Usuario", accessorKey: "user" },
    { header: "Acción", cell: ({ row }) => <Badge tone="indigo">{row.original.action}</Badge> },
    { header: "Entidad", accessorKey: "entity" },
    { header: "ID entidad", accessorKey: "entityId" },
    { header: "IP/origen", accessorKey: "origin" },
    { header: "Acciones", cell: ({ row }) => <Button variant="ghost" className="h-8 w-8 px-0" icon={<Eye className="h-4 w-4" />} onClick={() => setSelected(row.original)} aria-label="Ver" /> },
  ];
  return (
    <>
      <PageHeader title="Auditoría" description="Eventos de seguridad, cambios de entidad y trazabilidad operacional." />
      <DataTable data={query.data?.data ?? []} columns={columns} isLoading={query.isLoading} isError={query.isError} error={query.error} totalCount={query.data?.totalCount ?? 0} page={table.page} pageSize={table.pageSize} onPageChange={table.setPage} toolbar={<TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Buscar por usuario, entidad o acción" />} />
      <AuditDetailDrawer event={selected} onClose={() => setSelected(null)} />
    </>
  );
}
