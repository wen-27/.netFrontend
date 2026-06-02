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
import { Vehicle } from "../../../shared/types/domain";
import { vehiclesService } from "../services/vehiclesService";

const columns: ColumnDef<Vehicle>[] = [
  { header: "Placa", accessorKey: "plate" },
  { header: "VIN", accessorKey: "vin" },
  { header: "Marca", accessorKey: "brand" },
  { header: "Modelo", accessorKey: "model" },
  { header: "Tipo", accessorKey: "type" },
  { header: "Año", accessorKey: "year" },
  { header: "Color", accessorKey: "color" },
  { header: "Kilometraje", cell: ({ row }) => `${row.original.mileage.toLocaleString("es-CO")} km` },
  { header: "Propietario actual", accessorKey: "currentOwner" },
  { header: "Órdenes activas", cell: ({ row }) => <Badge tone={row.original.activeOrders > 0 ? "amber" : "green"}>{row.original.activeOrders}</Badge> },
  { header: "Acciones", meta: { className: "w-[12%] text-center" }, cell: ({ row }) => <div className="flex justify-center"><Button variant="secondary" className="min-h-8 px-2 text-xs" icon={<Eye className="h-4 w-4" />} onClick={() => location.assign(`/vehicles/${row.original.id}`)}>Ver detalles</Button></div> },
];

export function VehiclesListPage() {
  const table = useTableQueryState();
  const query = useQuery({ queryKey: ["vehicles", table.page, table.pageSize, table.search], queryFn: () => vehiclesService.list(table.params) });

  return (
    <>
      <PageHeader title="Vehículos" description="Consulta por placa, VIN, cliente, marca, modelo y tipo de vehículo." actions={<Button icon={<Plus className="h-4 w-4" />}><Link to="/vehicles/new">Registrar vehículo</Link></Button>} />
      <DataTable data={query.data?.data ?? []} columns={columns} isLoading={query.isLoading} isError={query.isError} error={query.error} totalCount={query.data?.totalCount ?? 0} page={table.page} pageSize={table.pageSize} onPageChange={table.setPage} toolbar={<TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Buscar por placa, VIN, propietario o marca" />} />
    </>
  );
}
