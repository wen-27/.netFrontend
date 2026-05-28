import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, ShieldPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { DataTable } from "../../../shared/components/data-table/DataTable";
import { TableToolbar } from "../../../shared/components/data-table/TableToolbar";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { useTableQueryState } from "../../../shared/hooks/useTableQueryState";
import { UserAccount } from "../../../shared/types/domain";
import { formatDateTime } from "../../../shared/utils/formatters";
import { usersService } from "../services/usersService";

const columns: ColumnDef<UserAccount>[] = [
  { header: "Nombre", accessorKey: "name" },
  { header: "Email", accessorKey: "email" },
  { header: "Roles", cell: ({ row }) => <div className="flex gap-1">{row.original.roles.map((role) => <Badge key={role} tone="indigo">{role}</Badge>)}</div> },
  { header: "Estado", cell: ({ row }) => <Badge tone="green">{row.original.status}</Badge> },
  { header: "Último acceso", cell: ({ row }) => formatDateTime(row.original.lastAccess) },
  { header: "Acciones", cell: ({ row }) => <Button variant="ghost" className="h-8 w-8 px-0" icon={<ShieldPlus className="h-4 w-4" />} onClick={() => location.assign(`/users/${row.original.id}/roles`)} aria-label="Roles" /> },
];

export function UsersListPage() {
  const table = useTableQueryState();
  const query = useQuery({ queryKey: ["users", table.page, table.pageSize, table.search], queryFn: () => usersService.list(table.params) });
  return (
    <>
      <PageHeader title="Usuarios y roles" description="Administración de usuarios internos, activación y roles." actions={<Button icon={<Plus className="h-4 w-4" />}><Link to="/users/new">Crear usuario</Link></Button>} />
      <DataTable data={query.data?.data ?? []} columns={columns} isLoading={query.isLoading} isError={query.isError} error={query.error} totalCount={query.data?.totalCount ?? 0} page={table.page} pageSize={table.pageSize} onPageChange={table.setPage} toolbar={<TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Buscar por nombre, email o rol" />} />
    </>
  );
}
