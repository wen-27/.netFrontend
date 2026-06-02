import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Eye, Plus, RefreshCw, XCircle } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiErrorAlert } from "../../../shared/components/feedback/ApiErrorAlert";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Badge } from "../../../shared/components/ui/Badge";
import { DataTable } from "../../../shared/components/data-table/DataTable";
import { TableToolbar } from "../../../shared/components/data-table/TableToolbar";
import { TablePagination } from "../../../shared/components/data-table/TablePagination";
import { formatCurrency, formatDateTime } from "../../../shared/utils/formatters";
import { getPaymentStatusLabel } from "../../../shared/utils/statusLabels";
import { receptionService, ReceptionCustomer, ReceptionPayment, ReceptionVehicle } from "../services/receptionService";

function fieldClass() {
  return "mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
}

function statusTone(status: string): "green" | "amber" | "red" | "blue" | "slate" {
  if (status === "Approved") return "green";
  if (status === "Rejected") return "red";
  if (status.includes("Pending")) return "amber";
  return "slate";
}

export function ReceptionCustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const query = useQuery({
    queryKey: ["reception-customers-list"],
    queryFn: () => receptionService.customers({ pageNumber: 1, pageSize: 500 }),
  });
  useEffect(() => setPage(1), [search]);
  const customers = query.data?.data ?? [];
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) => [
      customer.documentType,
      customer.documentNumber,
      customer.fullName,
      customer.primaryEmail,
      customer.primaryPhone,
    ].join(" ").toLowerCase().includes(term));
  }, [customers, search]);
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);
  return (
    <>
      <PageHeader
        title="Clientes"
        description="Clientes registrados y sus vehículos asociados."
        actions={(
          <>
            <Link to="/dashboard/reception"><Button variant="secondary">Dashboard</Button></Link>
            <Link to="/reception/customers/new"><Button icon={<Plus className="h-4 w-4" />}>Crear cliente</Button></Link>
          </>
        )}
      />
      <DataTable
        data={paged}
        columns={[
          { header: "Documento", accessorFn: (row: ReceptionCustomer) => `${row.documentType} ${row.documentNumber}` },
          { header: "Cliente", accessorKey: "fullName" },
          { header: "Correo", accessorKey: "primaryEmail" },
          { header: "Teléfono", accessorKey: "primaryPhone" },
          { header: "Vehículos", accessorKey: "vehiclesCount" },
          { header: "Estado", cell: ({ row }) => <Badge tone="green">{row.original.status}</Badge> },
          { header: "Acciones", cell: ({ row }) => <Link to={`/reception/customers/${row.original.id}`}><Button variant="secondary" icon={<Eye className="h-4 w-4" />}>Ver</Button></Link> },
        ]}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        totalCount={filtered.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        toolbar={<TableToolbar search={search} onSearchChange={setSearch} placeholder="Buscar por documento, nombre o correo" />}
      />
    </>
  );
}

export function ReceptionCustomerCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const documentTypes = useQuery({ queryKey: ["reception-document-types"], queryFn: receptionService.documentTypes });
  const [form, setForm] = useState({ documentTypeId: "1", documentNumber: "", firstName: "", middleName: "", lastName: "", secondLastName: "", email: "", phone: "" });
  const mutation = useMutation({
    mutationFn: () => receptionService.createCustomer({ ...form, documentTypeId: Number(form.documentTypeId), phoneCountryId: 1 }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["reception-customers-list"] }),
        queryClient.invalidateQueries({ queryKey: ["reception-customers-select"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-reception-recent-customers"] }),
      ]);
      navigate("/reception/customers", { replace: true });
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };
  return (
    <>
      <PageHeader
        title="Crear cliente"
        description="Registra los datos básicos y contacto principal del cliente."
        actions={<Link to="/reception/customers"><Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>Regresar</Button></Link>}
      />
      {mutation.isError ? <ApiErrorAlert error={mutation.error} action="No se pudo crear el cliente" className="mb-4" /> : null}
      <Card className="p-5">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <label className="text-sm font-semibold text-slate-700">Tipo de documento<select className={fieldClass()} value={form.documentTypeId} onChange={(event) => setForm({ ...form, documentTypeId: event.target.value })}>{(documentTypes.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700">Número de documento<input className={fieldClass()} required value={form.documentNumber} onChange={(event) => setForm({ ...form, documentNumber: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700">Nombres<input className={fieldClass()} required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700">Segundo nombre<input className={fieldClass()} value={form.middleName} onChange={(event) => setForm({ ...form, middleName: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700">Apellidos<input className={fieldClass()} required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700">Segundo apellido<input className={fieldClass()} value={form.secondLastName} onChange={(event) => setForm({ ...form, secondLastName: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700">Correo<input className={fieldClass()} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700">Teléfono<input className={fieldClass()} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button type="button" variant="secondary" onClick={() => navigate("/reception/customers")}>Cancelar</Button>
            <Button type="submit" isLoading={mutation.isPending}>Guardar cliente</Button>
          </div>
        </form>
      </Card>
    </>
  );
}

export function ReceptionCustomerDetailPage() {
  const { id = "" } = useParams();
  const customer = useQuery({ queryKey: ["reception-customer", id], queryFn: () => receptionService.customer(id), enabled: Boolean(id) });
  const vehicles = useQuery({ queryKey: ["reception-customer-vehicles", id], queryFn: () => receptionService.customerVehicles(id), enabled: Boolean(id) });
  return (
    <>
      <PageHeader title={customer.data?.fullName ?? "Cliente"} description="Detalle del cliente y vehículos asociados." actions={<Link to="/reception/customers"><Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>Regresar</Button></Link>} />
      {customer.isError ? <ApiErrorAlert error={customer.error} action="No se pudo cargar el cliente" /> : null}
      {customer.data ? <Card className="mb-5 p-5"><div className="grid gap-4 md:grid-cols-4"><Info label="Documento" value={`${customer.data.documentType} ${customer.data.documentNumber}`} /><Info label="Correo" value={customer.data.primaryEmail || "Sin correo"} /><Info label="Teléfono" value={customer.data.primaryPhone || "Sin teléfono"} /><Info label="Estado" value={customer.data.status} /></div></Card> : null}
      <PageHeader title="Vehículos del cliente" description="Vehículos asociados al propietario actual." actions={<Link to={`/reception/vehicles/new?ownerId=${id}`}><Button icon={<Plus className="h-4 w-4" />}>Registrar vehículo</Button></Link>} />
      <VehicleSimpleTable vehicles={vehicles.data ?? []} />
    </>
  );
}

export function ReceptionVehiclesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const query = useQuery({
    queryKey: ["reception-vehicles-list"],
    queryFn: () => receptionService.vehicles({ pageNumber: 1, pageSize: 500 }),
  });
  useEffect(() => setPage(1), [search]);
  const vehicles = query.data?.data ?? [];
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return vehicles;
    return vehicles.filter((vehicle) => [
      vehicle.plate,
      vehicle.vin,
      vehicle.brand,
      vehicle.model,
      vehicle.type,
      vehicle.currentOwner,
      vehicle.year,
    ].join(" ").toLowerCase().includes(term));
  }, [vehicles, search]);
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);
  return (
    <>
      <PageHeader
        title="Vehículos"
        description="Consulta por placa, VIN, propietario, marca o modelo."
        actions={(
          <>
            <Link to="/dashboard/reception"><Button variant="secondary">Dashboard</Button></Link>
            <Link to="/reception/vehicles/new"><Button icon={<Plus className="h-4 w-4" />}>Registrar vehículo</Button></Link>
          </>
        )}
      />
      <DataTable
        data={paged}
        columns={[
          { header: "Placa", accessorKey: "plate" },
          { header: "VIN", accessorKey: "vin" },
          { header: "Marca", accessorKey: "brand" },
          { header: "Modelo", accessorKey: "model" },
          { header: "Año", accessorKey: "year" },
          { header: "Propietario actual", accessorKey: "currentOwner" },
          { header: "Órdenes activas", accessorKey: "activeOrders" },
          { header: "Acciones", cell: ({ row }) => <Link to={`/reception/vehicles/${row.original.id}`}><Button variant="secondary" icon={<Eye className="h-4 w-4" />}>Ver</Button></Link> },
        ]}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        totalCount={filtered.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        toolbar={<TableToolbar search={search} onSearchChange={setSearch} placeholder="Buscar por placa, VIN, propietario, marca o modelo" />}
      />
    </>
  );
}

export function ReceptionVehicleCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = new URLSearchParams(window.location.search) ? [new URLSearchParams(window.location.search)] : [new URLSearchParams()];
  const customers = useQuery({ queryKey: ["reception-customers-select"], queryFn: () => receptionService.customers({ pageNumber: 1, pageSize: 500 }) });
  const models = useQuery({ queryKey: ["reception-vehicle-models"], queryFn: receptionService.vehicleModels });
  const types = useQuery({ queryKey: ["reception-vehicle-types"], queryFn: receptionService.vehicleTypes });
  const [form, setForm] = useState({ ownerPersonId: params.get("ownerId") ?? "", modelId: "", vehicleTypeId: "", plate: "", vin: "", year: String(new Date().getFullYear()), color: "", mileage: "0" });
  const mutation = useMutation({
    mutationFn: () => receptionService.createVehicle({ ...form, ownerPersonId: Number(form.ownerPersonId), modelId: Number(form.modelId), vehicleTypeId: Number(form.vehicleTypeId), year: Number(form.year), mileage: Number(form.mileage) }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["reception-vehicles-list"] }),
        queryClient.invalidateQueries({ queryKey: ["reception-customer-vehicles", form.ownerPersonId] }),
        queryClient.invalidateQueries({ queryKey: ["reception-customers-list"] }),
      ]);
      navigate(form.ownerPersonId ? `/reception/customers/${form.ownerPersonId}` : "/reception/vehicles", { replace: true });
    },
  });
  const submit = (event: FormEvent) => { event.preventDefault(); mutation.mutate(); };
  return (
    <>
      <PageHeader title="Registrar vehículo" description="Crea el vehículo y lo deja asociado a un cliente propietario." actions={<Link to="/reception/vehicles"><Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>Regresar</Button></Link>} />
      {mutation.isError ? <ApiErrorAlert error={mutation.error} action="No se pudo registrar el vehículo" className="mb-4" /> : null}
      <Card className="p-5">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <label className="text-sm font-semibold text-slate-700">Cliente propietario<select className={fieldClass()} required value={form.ownerPersonId} onChange={(event) => setForm({ ...form, ownerPersonId: event.target.value })}><option value="">Seleccionar</option>{(customers.data?.data ?? []).map((customer) => <option key={customer.id} value={customer.id}>{customer.fullName} - {customer.documentNumber}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700">Placa<input className={fieldClass()} required minLength={5} maxLength={10} value={form.plate} onChange={(event) => setForm({ ...form, plate: event.target.value.toUpperCase() })} /></label>
          <label className="text-sm font-semibold text-slate-700">VIN<input className={fieldClass()} required minLength={17} maxLength={17} value={form.vin} onChange={(event) => setForm({ ...form, vin: event.target.value.toUpperCase() })} /></label>
          <label className="text-sm font-semibold text-slate-700">Modelo<select className={fieldClass()} required value={form.modelId} onChange={(event) => setForm({ ...form, modelId: event.target.value })}><option value="">Seleccionar</option>{(models.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700">Tipo<select className={fieldClass()} required value={form.vehicleTypeId} onChange={(event) => setForm({ ...form, vehicleTypeId: event.target.value })}><option value="">Seleccionar</option>{(types.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700">Año<input className={fieldClass()} type="number" required value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700">Kilometraje<input className={fieldClass()} type="number" required min={0} value={form.mileage} onChange={(event) => setForm({ ...form, mileage: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700 md:col-span-2">Color<input className={fieldClass()} value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /></label>
          <div className="flex justify-end gap-2 md:col-span-2"><Button type="button" variant="secondary" onClick={() => navigate("/reception/vehicles")}>Cancelar</Button><Button type="submit" isLoading={mutation.isPending}>Guardar vehículo</Button></div>
        </form>
      </Card>
    </>
  );
}

export function ReceptionVehicleDetailPage() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const vehicle = useQuery({ queryKey: ["reception-vehicle", id], queryFn: () => receptionService.vehicle(id), enabled: Boolean(id) });
  const history = useQuery({ queryKey: ["reception-vehicle-history", id], queryFn: () => receptionService.vehicleOwnerHistory(id), enabled: Boolean(id) });
  const customers = useQuery({ queryKey: ["reception-customers-select"], queryFn: () => receptionService.customers({ pageNumber: 1, pageSize: 500 }) });
  const [newOwnerPersonId, setNewOwnerPersonId] = useState("");
  const [observation, setObservation] = useState("");
  const transferMutation = useMutation({
    mutationFn: () => receptionService.transferVehicle(id, { newOwnerPersonId: Number(newOwnerPersonId), observation }),
    onSuccess: async () => {
      setNewOwnerPersonId("");
      setObservation("");
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["reception-vehicle", id] }), queryClient.invalidateQueries({ queryKey: ["reception-vehicle-history", id] })]);
    },
  });
  return (
    <>
      <PageHeader title={vehicle.data ? `${vehicle.data.brand} ${vehicle.data.model}` : "Vehículo"} description="Propietario actual, datos técnicos e historial de propietarios." actions={<Link to="/reception/vehicles"><Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>Regresar</Button></Link>} />
      {vehicle.data ? <Card className="mb-5 p-5"><div className="grid gap-4 md:grid-cols-5"><Info label="Placa" value={vehicle.data.plate} /><Info label="VIN" value={vehicle.data.vin} /><Info label="Propietario actual" value={vehicle.data.currentOwner} /><Info label="Tipo" value={vehicle.data.type} /><Info label="Kilometraje" value={`${vehicle.data.mileage.toLocaleString("es-CO")} km`} /></div></Card> : null}
      {transferMutation.isError ? <ApiErrorAlert error={transferMutation.error} action="No se pudo transferir el vehículo" className="mb-4" /> : null}
      <Card className="mb-5 p-5">
        <h2 className="font-bold text-slate-900">Transferir propietario</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <select className={fieldClass()} value={newOwnerPersonId} onChange={(event) => setNewOwnerPersonId(event.target.value)}><option value="">Seleccionar nuevo propietario</option>{(customers.data?.data ?? []).filter((customer) => customer.id !== vehicle.data?.currentOwnerId).map((customer) => <option key={customer.id} value={customer.id}>{customer.fullName} - {customer.documentNumber}</option>)}</select>
          <input className={fieldClass()} placeholder="Observación o motivo" value={observation} onChange={(event) => setObservation(event.target.value)} />
          <Button isLoading={transferMutation.isPending} disabled={!newOwnerPersonId} onClick={() => transferMutation.mutate()} icon={<RefreshCw className="h-4 w-4" />}>Transferir</Button>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <table className="w-full table-fixed text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3">Propietario</th><th className="px-3 py-3">Inicio</th><th className="px-3 py-3">Fin</th><th className="px-3 py-3">Estado</th></tr></thead><tbody className="divide-y divide-slate-100">{(history.data ?? []).map((item) => <tr key={item.id}><td className="px-3 py-3 font-semibold">{item.owner}</td><td className="px-3 py-3">{formatDateTime(item.startDate)}</td><td className="px-3 py-3">{item.endDate ? formatDateTime(item.endDate) : "Actual"}</td><td className="px-3 py-3"><Badge tone={item.isCurrent ? "green" : "slate"}>{item.isCurrent ? "Actual" : "Histórico"}</Badge></td></tr>)}</tbody></table>
      </Card>
    </>
  );
}

function VehicleSimpleTable({ vehicles }: { vehicles: ReceptionVehicle[] }) {
  return <Card className="overflow-hidden"><table className="w-full table-fixed text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3">Placa</th><th className="px-3 py-3">VIN</th><th className="px-3 py-3">Vehículo</th><th className="px-3 py-3">Kilometraje</th><th className="px-3 py-3">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100">{vehicles.length === 0 ? <tr><td className="px-3 py-5 font-semibold text-slate-500" colSpan={5}>No hay vehículos asociados.</td></tr> : null}{vehicles.map((vehicle) => <tr key={vehicle.id}><td className="px-3 py-3">{vehicle.plate}</td><td className="px-3 py-3">{vehicle.vin}</td><td className="px-3 py-3">{vehicle.brand} {vehicle.model}</td><td className="px-3 py-3">{vehicle.mileage.toLocaleString("es-CO")} km</td><td className="px-3 py-3"><Link to={`/reception/vehicles/${vehicle.id}`}><Button variant="secondary">Ver</Button></Link></td></tr>)}</tbody></table></Card>;
}

export function ReceptionPaymentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ReceptionPayment | null>(null);
  const pageSize = 8;
  const query = useQuery({ queryKey: ["reception-payments", search, status], queryFn: () => receptionService.payments({ search, status }) });
  const payments = query.data ?? [];
  const currentPage = Math.min(page, Math.max(1, Math.ceil(payments.length / pageSize)));
  const paged = payments.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return (
    <>
      <PageHeader
        title="Pagos de clientes"
        description="Consulta, filtra y verifica pagos enviados por clientes."
        actions={<Link to="/dashboard/reception"><Button variant="secondary">Dashboard</Button></Link>}
      />
      <Card className="mb-4 p-4"><div className="grid gap-3 md:grid-cols-[1fr_220px]"><input className={fieldClass()} placeholder="Buscar por cliente, documento, orden, factura o referencia" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /><select className={fieldClass()} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Todos los estados</option><option value="PendingReceptionVerification">Pendiente revisión de pago</option><option value="Approved">Verificado</option><option value="Rejected">Rechazado</option></select></div></Card>
      {query.isError ? <ApiErrorAlert error={query.error} action="No se pudieron cargar los pagos" /> : null}
      <Card className="overflow-hidden"><table className="w-full table-fixed text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3">Fecha</th><th className="px-3 py-3">Cliente</th><th className="px-3 py-3">Vehículo</th><th className="px-3 py-3">Orden/Factura</th><th className="px-3 py-3">Monto</th><th className="px-3 py-3">Saldo</th><th className="px-3 py-3">Estado</th><th className="px-3 py-3">Acción</th></tr></thead><tbody className="divide-y divide-slate-100">{paged.map((payment) => <tr key={payment.id}><td className="break-words px-3 py-3">{formatDateTime(payment.date)}</td><td className="break-words px-3 py-3"><p className="font-semibold">{payment.customer}</p><p className="text-xs text-slate-500">{payment.clientDocument}</p></td><td className="break-words px-3 py-3">{payment.vehicle}</td><td className="break-words px-3 py-3">OT-{payment.serviceOrderId} / FV-{payment.invoiceId}</td><td className="px-3 py-3">{formatCurrency(payment.amount)}</td><td className="px-3 py-3">{formatCurrency(payment.balance)}</td><td className="px-3 py-3"><Badge tone={statusTone(payment.status)}>{getPaymentStatusLabel(payment.status)}</Badge></td><td className="px-3 py-3"><Button variant="secondary" onClick={() => setSelected(payment)}>Ver</Button></td></tr>)}</tbody></table><TablePagination page={currentPage} pageSize={pageSize} totalCount={payments.length} onPageChange={setPage} /></Card>
      {selected ? <ReceptionPaymentReview payment={selected} onClose={() => setSelected(null)} /> : null}
    </>
  );
}

function ReceptionPaymentReview({ payment, onClose }: { payment: ReceptionPayment; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [deliveryDate, setDeliveryDate] = useState("");
  const [comment, setComment] = useState("");
  const canReviewPayment = payment.status === "PendingReceptionVerification";
  const approve = useMutation({
    mutationFn: () => receptionService.approvePayment(payment.id, { deliveryDate }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["reception-payments"] }),
        queryClient.invalidateQueries({ queryKey: ["payments-verification"] }),
        queryClient.invalidateQueries({ queryKey: ["reception-deliveries"] }),
      ]);
      onClose();
    },
  });
  const reject = useMutation({
    mutationFn: () => receptionService.rejectPayment(payment.id, { comment }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["reception-payments"] }),
        queryClient.invalidateQueries({ queryKey: ["payments-verification"] }),
      ]);
      onClose();
    },
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <Card className="w-full max-w-2xl p-5">
        <h2 className="text-lg font-bold text-slate-950">Detalle de pago</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2"><Info label="Cliente" value={payment.customer} /><Info label="Vehículo" value={payment.vehicle} /><Info label="Factura" value={`FV-${payment.invoiceId}`} /><Info label="Valor pagado" value={formatCurrency(payment.amount)} /><Info label="Método" value={payment.method} /><Info label="Referencia" value={payment.reference} /></div>
        {(approve.isError || reject.isError) ? <ApiErrorAlert error={approve.error ?? reject.error} action="No se pudo procesar el pago" className="mt-4" /> : null}
        {!canReviewPayment ? <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">Este pago ya fue procesado. Estado actual: {getPaymentStatusLabel(payment.status)}.</p> : null}
        <div className="mt-4 grid gap-3 md:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Fecha de entrega<input className={fieldClass()} type="date" value={deliveryDate} disabled={!canReviewPayment} onChange={(event) => setDeliveryDate(event.target.value)} /></label><label className="text-sm font-semibold text-slate-700">Motivo de rechazo<input className={fieldClass()} value={comment} disabled={!canReviewPayment} onChange={(event) => setComment(event.target.value)} /></label></div>
        <div className="mt-5 flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cerrar</Button><Button variant="secondary" disabled={!canReviewPayment || !comment.trim()} isLoading={reject.isPending} onClick={() => reject.mutate()} icon={<XCircle className="h-4 w-4" />}>Rechazar</Button><Button disabled={!canReviewPayment || !deliveryDate} isLoading={approve.isPending} onClick={() => approve.mutate()} icon={<CheckCircle2 className="h-4 w-4" />}>Verificar</Button></div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div>;
}
