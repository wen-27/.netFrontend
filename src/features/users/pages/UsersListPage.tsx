import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Power, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { ApiErrorAlert } from "../../../shared/components/feedback/ApiErrorAlert";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { Modal } from "../../../shared/components/ui/Modal";
import { DataTable } from "../../../shared/components/data-table/DataTable";
import { TableToolbar } from "../../../shared/components/data-table/TableToolbar";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { useTableQueryState } from "../../../shared/hooks/useTableQueryState";
import { Role, roleLabels, rolePriority } from "../../../shared/types/common";
import { UserAccount } from "../../../shared/types/domain";
import { formatDateTime } from "../../../shared/utils/formatters";
import { usersService } from "../services/usersService";

const editableRoles = rolePriority;

function isEditableRole(role: string): role is Role {
  return editableRoles.includes(role as Role);
}

export function UsersListPage() {
  const table = useTableQueryState();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const query = useQuery({ queryKey: ["users", table.page, table.pageSize, table.search], queryFn: () => usersService.list(table.params) });
  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => usersService.updateStatus(id, { isActive }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
  const rolesMutation = useMutation({
    mutationFn: ({ id, roleNames }: { id: string; roleNames: Role[] }) => usersService.updateRoles(id, { roleNames }),
    onSuccess: async () => {
      setEditingUser(null);
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  const openEditor = (user: UserAccount) => {
    setEditingUser(user);
    setSelectedRoles(user.roles.filter(isEditableRole));
    rolesMutation.reset();
  };

  const toggleRole = (role: Role) => {
    setSelectedRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role],
    );
  };

  const columns: ColumnDef<UserAccount>[] = [
    { header: "Nombre", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { header: "Roles", cell: ({ row }) => <div className="flex flex-wrap gap-1">{row.original.roles.length ? row.original.roles.map((role) => <Badge key={role} tone="indigo">{role}</Badge>) : <Badge tone="slate">Sin rol</Badge>}</div> },
    { header: "Estado", cell: ({ row }) => <Badge tone={row.original.status === "Activo" ? "green" : "red"}>{row.original.status}</Badge> },
    { header: "Último acceso", cell: ({ row }) => formatDateTime(row.original.lastAccess) },
    {
      header: "Acciones",
      cell: ({ row }) => {
        const isActive = row.original.status === "Activo";
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="h-8 min-h-8 px-3"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => openEditor(row.original)}
            >
              Editar
            </Button>
            <Button
              variant="ghost"
              className="h-8 w-8 px-0"
              icon={<Power className="h-4 w-4" />}
              isLoading={statusMutation.isPending}
              onClick={() => statusMutation.mutate({ id: row.original.id, isActive: !isActive })}
              aria-label={isActive ? "Desactivar usuario" : "Activar usuario"}
            />
          </div>
        );
      },
    },
  ];
  return (
    <>
      <PageHeader title="Usuarios y roles" description="Administración de usuarios internos, activación y roles." actions={<Button icon={<Plus className="h-4 w-4" />}><Link to="/users/new">Crear usuario</Link></Button>} />
      <DataTable data={query.data?.data ?? []} columns={columns} isLoading={query.isLoading} isError={query.isError} error={query.error} totalCount={query.data?.totalCount ?? 0} page={table.page} pageSize={table.pageSize} onPageChange={table.setPage} toolbar={<TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Buscar por nombre, email o rol" />} />
      <Modal open={Boolean(editingUser)} title="Editar roles y permisos" onClose={() => setEditingUser(null)}>
        {editingUser ? (
          <div className="space-y-5">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{editingUser.name}</p>
              <p className="break-words text-sm text-slate-600">{editingUser.email}</p>
            </div>

            {rolesMutation.isError ? <ApiErrorAlert error={rolesMutation.error} action="No se pudieron actualizar los roles" /> : null}

            <div className="grid gap-3 sm:grid-cols-2">
              {editableRoles.map((role) => {
                const checked = selectedRoles.includes(role);
                return (
                  <label
                    key={role}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition ${checked ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                      checked={checked}
                      onChange={() => toggleRole(role)}
                    />
                    <span>
                      <span className="block font-semibold text-slate-900">{roleLabels[role]}</span>
                      <span className="block text-xs font-semibold text-slate-500">{role}</span>
                    </span>
                  </label>
                );
              })}
            </div>

            {selectedRoles.length === 0 ? <p className="text-sm font-semibold text-red-600">Selecciona al menos un rol para guardar.</p> : null}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditingUser(null)}>Cancelar</Button>
              <Button
                type="button"
                isLoading={rolesMutation.isPending}
                disabled={selectedRoles.length === 0}
                onClick={() => rolesMutation.mutate({ id: editingUser.id, roleNames: selectedRoles })}
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
