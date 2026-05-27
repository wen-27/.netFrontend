import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, MailPlus, Pencil, PhoneCall, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { DataTable } from "../../../shared/components/data-table/DataTable";
import { TableToolbar } from "../../../shared/components/data-table/TableToolbar";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { useTableQueryState } from "../../../shared/hooks/useTableQueryState";
import { Person } from "../../../shared/types/domain";
import { personsService } from "../services/personsService";

const columns: ColumnDef<Person>[] = [
  { header: "Documento", accessorFn: (row) => `${row.documentType} ${row.documentNumber}` },
  { header: "Nombre completo", accessorKey: "fullName" },
  { header: "Roles", cell: ({ row }) => <div className="flex flex-wrap gap-1">{row.original.roles.map((role) => <Badge key={role} tone="indigo">{role}</Badge>)}</div> },
  { header: "Email principal", accessorKey: "primaryEmail" },
  { header: "Teléfono principal", accessorKey: "primaryPhone" },
  { header: "Vehículos", accessorKey: "vehiclesCount" },
  { header: "Estado", cell: ({ row }) => <Badge tone="green">{row.original.status}</Badge> },
  { header: "Acciones", cell: ({ row }) => <div className="flex gap-1"><Button variant="ghost" className="h-8 w-8 px-0" icon={<Eye className="h-4 w-4" />} onClick={() => location.assign(`/persons/${row.original.id}`)} aria-label="Ver" /><Button variant="ghost" className="h-8 w-8 px-0" icon={<Pencil className="h-4 w-4" />} onClick={() => location.assign(`/persons/${row.original.id}/edit`)} aria-label="Editar" /><Button variant="ghost" className="h-8 w-8 px-0" icon={<MailPlus className="h-4 w-4" />} aria-label="Agregar correo" /><Button variant="ghost" className="h-8 w-8 px-0" icon={<PhoneCall className="h-4 w-4" />} aria-label="Agregar teléfono" /></div> },
];

export function PersonsListPage() {
  const table = useTableQueryState();
  const query = useQuery({ queryKey: ["persons", table.page, table.pageSize, table.search], queryFn: () => personsService.list(table.params) });

  return (
    <>
      <PageHeader title="Clientes y personas" description="Gestión de clientes, contactos, roles y relación con vehículos." actions={<Button icon={<Plus className="h-4 w-4" />}><Link to="/persons/new">Crear persona</Link></Button>} />
      <DataTable
        data={query.data?.data ?? []}
        columns={columns}
        isLoading={query.isLoading}
        isError={query.isError}
        totalCount={query.data?.totalCount ?? 0}
        page={table.page}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        toolbar={<TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Buscar por documento, nombre o email" />}
      />
    </>
  );
}
