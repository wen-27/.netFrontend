import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Modal } from "../../../shared/components/ui/Modal";
import { DataTable } from "../../../shared/components/data-table/DataTable";
import { TableToolbar } from "../../../shared/components/data-table/TableToolbar";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { useTableQueryState } from "../../../shared/hooks/useTableQueryState";
import { formatCurrency, formatDate } from "../../../shared/utils/formatters";
import { ServiceOrder } from "../../../shared/types/domain";
import { getWorkshopServices } from "../../operations/services/operationsService";
import { serviceOrdersService } from "../services/serviceOrdersService";
import { OrderStatusBadge } from "../components/OrderStatusBadge";

const statusOptions = [
  { label: "Todas activas", value: "" },
  { label: "Creada", value: "1" },
  { label: "Pendiente de asignación", value: "2" },
  { label: "Asignada", value: "3" },
  { label: "En progreso", value: "4" },
  { label: "Esperando pago", value: "6" },
  { label: "Pago en revisión", value: "7" },
  { label: "Lista para entrega", value: "9" },
];

const activeStatuses = new Set(["Created", "PendingAssignment", "Assigned", "InProgress", "WaitingForPayment", "PaymentUnderReview", "ReadyForDelivery"]);
function completionServiceNames(order: ServiceOrder | null) {
  if (!order) return [];
  if (order.orderServices?.length) return order.orderServices.map((service) => service.name);
  return order.services ?? [];
}

function buildCompletionReport({
  order,
  technicalSummary,
  diagnosticFindings,
  performedServices,
  checklist,
  testsPerformed,
  finalRecommendation,
  observations,
  entryDate,
  mileage,
  estimatedDeliveryDate,
  fuelLevel,
  objectsInsideVehicle,
  checklistNotes,
}: {
  order: ServiceOrder;
  technicalSummary: string;
  diagnosticFindings: string;
  performedServices: string[];
  checklist: Record<string, boolean>;
  testsPerformed: string;
  finalRecommendation: string;
  observations: string;
  entryDate: string;
  mileage: string;
  estimatedDeliveryDate: string;
  fuelLevel: string;
  objectsInsideVehicle: string;
  checklistNotes: string;
}) {
  return [
    `CIERRE TECNICO DE ORDEN ${order.code}`,
    `Cliente: ${order.customer}`,
    `Vehiculo: ${order.vehicle}`,
    `Fecha de ingreso: ${entryDate || order.entryDate}`,
    `Kilometraje: ${mileage || "No registrado"}`,
    `Entrega estimada: ${estimatedDeliveryDate || order.estimatedDelivery || "No registrada"}`,
    "",
    "DESCRIPCION GENERAL / PROBLEMA REPORTADO",
    technicalSummary.trim(),
    "",
    "HALLAZGOS DEL DIAGNOSTICO",
    diagnosticFindings.trim(),
    "",
    "SERVICIOS COMPLETADOS",
    performedServices.length ? performedServices.map((service) => `- ${service}`).join("\n") : "- Sin servicios seleccionados",
    "",
    "CHECKLIST DE INGRESO Y CIERRE",
    [
      `- Luces: ${checklist.lights ? "OK" : "Pendiente"}`,
      `- Llantas: ${checklist.tires ? "OK" : "Pendiente"}`,
      `- Espejos: ${checklist.mirrors ? "OK" : "Pendiente"}`,
      `- Documentos: ${checklist.documents ? "Entregados" : "No entregados"}`,
      `- Herramientas: ${checklist.tools ? "Si" : "No"}`,
      `- Rayones/golpes: ${checklist.scratchesOrDents ? "Si" : "No"}`,
      `- Nivel de combustible: ${fuelLevel}`,
      `- Objetos dentro del vehiculo: ${objectsInsideVehicle}`,
      `- Notas checklist: ${checklistNotes || "Sin notas"}`,
    ].join("\n"),
    "",
    "PRUEBAS REALIZADAS",
    testsPerformed.trim(),
    "",
    "RECOMENDACION FINAL",
    finalRecommendation.trim(),
    observations.trim() ? `\nOBSERVACIONES\n${observations.trim()}` : "",
  ].filter(Boolean).join("\n");
}

function ServiceOrdersTablePage({ pendingClientApprovalOnly = false, createdOnly = false }: { pendingClientApprovalOnly?: boolean; createdOnly?: boolean }) {
  const table = useTableQueryState();
  const queryClient = useQueryClient();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/reception") ? "/reception/service-orders" : "/service-orders";
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ statusId: "", customer: "", vehicle: "", orderCode: "", mechanic: "" });
  const [orderToComplete, setOrderToComplete] = useState<ServiceOrder | null>(null);
  const [technicalSummary, setTechnicalSummary] = useState("");
  const [diagnosticFindings, setDiagnosticFindings] = useState("");
  const [testsPerformed, setTestsPerformed] = useState("");
  const [finalRecommendation, setFinalRecommendation] = useState("");
  const [completionObservations, setCompletionObservations] = useState("");
  const [completionEntryDate, setCompletionEntryDate] = useState("");
  const [completionMileage, setCompletionMileage] = useState("");
  const [completionEstimatedDelivery, setCompletionEstimatedDelivery] = useState("");
  const [fuelLevel, setFuelLevel] = useState("");
  const [objectsInsideVehicle, setObjectsInsideVehicle] = useState("");
  const [checklistNotes, setChecklistNotes] = useState("");
  const [completionChecklist, setCompletionChecklist] = useState({
    lights: true,
    tires: true,
    mirrors: true,
    documents: true,
    tools: false,
    scratchesOrDents: false,
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [additionalServiceId, setAdditionalServiceId] = useState("");
  const search = [table.search, filters.customer, filters.orderCode, filters.mechanic].filter(Boolean).join(" ");
  const queryParams = {
    ...table.params,
    search,
    statusId: createdOnly ? 1 : pendingClientApprovalOnly ? 5 : filters.statusId ? Number(filters.statusId) : undefined,
    vin: filters.vehicle || undefined,
  };
  const query = useQuery({ queryKey: ["service-orders", table.page, table.pageSize, search, filters.statusId, filters.vehicle, pendingClientApprovalOnly, createdOnly], queryFn: () => serviceOrdersService.list(queryParams) });
  const completeMutation = useMutation({
    mutationFn: () => {
      if (!orderToComplete) throw new Error("No hay una orden seleccionada.");
      const workPerformed = buildCompletionReport({
        order: orderToComplete,
        technicalSummary,
        diagnosticFindings,
        performedServices: selectedServices,
        checklist: completionChecklist,
        testsPerformed,
        finalRecommendation,
        observations: completionObservations,
        entryDate: completionEntryDate,
        mileage: completionMileage,
        estimatedDeliveryDate: completionEstimatedDelivery,
        fuelLevel,
        objectsInsideVehicle,
        checklistNotes,
      });
      return serviceOrdersService.completeMechanicOrder(orderToComplete.id, { workPerformed });
    },
    onSuccess: async () => {
      setOrderToComplete(null);
      setTechnicalSummary("");
      setDiagnosticFindings("");
      setTestsPerformed("");
      setFinalRecommendation("");
      setCompletionObservations("");
      setCompletionEntryDate("");
      setCompletionMileage("");
      setCompletionEstimatedDelivery("");
      setFuelLevel("");
      setObjectsInsideVehicle("");
      setChecklistNotes("");
      setCompletionChecklist({ lights: true, tires: true, mirrors: true, documents: true, tools: false, scratchesOrDents: false });
      setSelectedServices([]);
      setAdditionalServiceId("");
      await queryClient.invalidateQueries({ queryKey: ["service-orders"] });
    },
  });
  const workshopServicesQuery = useQuery({ queryKey: ["completion-workshop-services"], queryFn: getWorkshopServices, enabled: createdOnly });
  const availableServices = useMemo(() => completionServiceNames(orderToComplete), [orderToComplete]);
  const serviceOptions = useMemo(() => {
    const baseServices = availableServices.length ? availableServices : ["Diagnóstico general"];
    const catalogServices = (workshopServicesQuery.data ?? []).map((service) => service.name);
    return [...new Set([...baseServices, ...catalogServices])];
  }, [availableServices, workshopServicesQuery.data]);
  const canCompleteOrder = Boolean(
    orderToComplete &&
    technicalSummary.trim() &&
    diagnosticFindings.trim() &&
    testsPerformed.trim() &&
    finalRecommendation.trim() &&
    completionEntryDate &&
    completionMileage.trim() &&
    completionEstimatedDelivery &&
    fuelLevel.trim() &&
    objectsInsideVehicle.trim() &&
    selectedServices.length > 0
  );
  useEffect(() => {
    if (!orderToComplete) return;
    const services = completionServiceNames(orderToComplete);
    setSelectedServices(services.length ? services : ["Diagnóstico general"]);
    setAdditionalServiceId("");
    setTechnicalSummary(orderToComplete.workPerformed ?? "");
    setDiagnosticFindings("");
    setTestsPerformed("");
    setFinalRecommendation("");
    setCompletionObservations("");
    setCompletionEntryDate(orderToComplete.entryDate ? orderToComplete.entryDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
    setCompletionEstimatedDelivery(orderToComplete.estimatedDelivery ? orderToComplete.estimatedDelivery.slice(0, 10) : "");
    setCompletionMileage("");
    setFuelLevel("");
    setObjectsInsideVehicle("");
    setChecklistNotes("");
    setCompletionChecklist({ lights: true, tires: true, mirrors: true, documents: true, tools: false, scratchesOrDents: false });
  }, [orderToComplete]);
  const columns: ColumnDef<ServiceOrder>[] = [
    { header: "Código orden", accessorKey: "code" },
    { header: "Cliente", accessorKey: "customer" },
    { header: "Vehículo", accessorKey: "vehicle" },
    { header: "Estado", cell: ({ row }) => <OrderStatusBadge status={row.original.status} /> },
    { header: "Servicios", cell: ({ row }) => <span className="block whitespace-normal break-words leading-snug">{row.original.services?.join(", ") || "Sin servicios"}</span> },
    { header: "Mecánicos asignados", cell: ({ row }) => <span className="block whitespace-normal break-words leading-snug">{row.original.assignedMechanics?.join(", ") || row.original.mechanic || "Sin asignar"}</span> },
    { header: "Fecha ingreso", cell: ({ row }) => formatDate(row.original.entryDate) },
    { header: "Entrega estimada", cell: ({ row }) => formatDate(row.original.estimatedDelivery) },
    { header: "Total estimado", cell: ({ row }) => formatCurrency(row.original.estimatedTotal) },
    {
      header: "Acciones",
      meta: { className: "w-[10%] text-center" },
      cell: ({ row }) => (
        <div className="flex flex-col items-stretch gap-2">
          <Link to={createdOnly ? `/mechanic/chief-orders/${row.original.id}` : `${basePath}/${row.original.id}`}>
            <Button variant="secondary" className="min-h-9 w-full px-2 text-xs" icon={<Eye className="h-4 w-4" />} aria-label="Ver detalle">Ver</Button>
          </Link>
          {createdOnly ? (
            <Button
              className="min-h-9 w-full px-2 text-xs"
              isLoading={completeMutation.isPending}
              onClick={() => {
                setOrderToComplete(row.original);
              }}
            >
              Completar
            </Button>
          ) : null}
        </div>
      ),
    },
  ];
  const visibleOrders = useMemo(() => {
    return (query.data?.data ?? []).filter((order) => {
      if (createdOnly) {
        if (String(order.status) !== "Created") return false;
      } else if (pendingClientApprovalOnly) {
        if (String(order.status) !== "PendingClientApproval") return false;
      } else if (!activeStatuses.has(String(order.status))) {
        return false;
      }
      const matchesCustomer = !filters.customer || order.customer.toLowerCase().includes(filters.customer.toLowerCase());
      const matchesVehicle = !filters.vehicle || order.vehicle.toLowerCase().includes(filters.vehicle.toLowerCase());
      const matchesOrderCode = !filters.orderCode || order.code.toLowerCase().includes(filters.orderCode.toLowerCase());
      const matchesMechanic = !filters.mechanic || order.mechanic.toLowerCase().includes(filters.mechanic.toLowerCase());
      return matchesCustomer && matchesVehicle && matchesOrderCode && matchesMechanic;
    });
  }, [createdOnly, filters, pendingClientApprovalOnly, query.data?.data]);

  return (
    <>
      <PageHeader
        title={createdOnly ? "Órdenes del jefe" : pendingClientApprovalOnly ? "Órdenes pendientes de aprobación" : "Órdenes activas"}
        description={createdOnly ? "Órdenes vacías creadas por el Jefe de Taller para diagnóstico." : pendingClientApprovalOnly ? "Órdenes completas que esperan aprobación del cliente." : "Órdenes que el taller tiene activas para seguimiento y ejecución."}
        actions={pendingClientApprovalOnly || createdOnly ? undefined : <Button icon={<Plus className="h-4 w-4" />}><Link to={`${basePath}/new`}>Crear orden</Link></Button>}
      />
      {showFilters && !pendingClientApprovalOnly ? (
        <Card className="mb-4 grid gap-3 p-4 md:grid-cols-5">
          <label className="text-sm font-semibold text-slate-700">Estado<select className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={filters.statusId} onChange={(event) => setFilters((current) => ({ ...current, statusId: event.target.value }))}>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700">Cliente<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={filters.customer} onChange={(event) => setFilters((current) => ({ ...current, customer: event.target.value }))} /></label>
          <label className="text-sm font-semibold text-slate-700">Vehículo<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={filters.vehicle} onChange={(event) => setFilters((current) => ({ ...current, vehicle: event.target.value }))} /></label>
          <label className="text-sm font-semibold text-slate-700">Código orden<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={filters.orderCode} onChange={(event) => setFilters((current) => ({ ...current, orderCode: event.target.value }))} /></label>
          <label className="text-sm font-semibold text-slate-700">Mecánico<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={filters.mechanic} onChange={(event) => setFilters((current) => ({ ...current, mechanic: event.target.value }))} /></label>
        </Card>
      ) : null}
      <DataTable data={visibleOrders} columns={columns} isLoading={query.isLoading} isError={query.isError} error={query.error} totalCount={query.data?.totalCount ?? visibleOrders.length} page={table.page} pageSize={table.pageSize} onPageChange={table.setPage} toolbar={<TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Buscar por cliente, vehículo, estado, orden o mecánico" onFiltersClick={() => setShowFilters((current) => !current)} />} />
      <Modal
        open={Boolean(orderToComplete)}
        title={orderToComplete ? `Completar ${orderToComplete.code}` : "Completar orden"}
        onClose={() => {
          if (!completeMutation.isPending) {
            setOrderToComplete(null);
            setTechnicalSummary("");
            setDiagnosticFindings("");
            setTestsPerformed("");
            setFinalRecommendation("");
            setCompletionObservations("");
            setCompletionEntryDate("");
            setCompletionMileage("");
            setCompletionEstimatedDelivery("");
            setFuelLevel("");
            setObjectsInsideVehicle("");
            setChecklistNotes("");
            setCompletionChecklist({ lights: true, tires: true, mirrors: true, documents: true, tools: false, scratchesOrDents: false });
            setSelectedServices([]);
            setAdditionalServiceId("");
          }
        }}
      >
        <div className="grid max-h-[75vh] gap-5 overflow-y-auto pr-1">
          <p className="text-sm text-slate-600">Completa la información técnica, checklist y servicios antes de enviar la orden a aprobación del cliente.</p>
          {completeMutation.error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">No se pudo completar la orden.</p> : null}
          <section className="grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Fecha de ingreso</span>
              <input className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" type="date" value={completionEntryDate} onChange={(event) => setCompletionEntryDate(event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Kilometraje</span>
              <input className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" type="number" min={0} value={completionMileage} onChange={(event) => setCompletionMileage(event.target.value)} placeholder="Km actuales" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Entrega estimada</span>
              <input className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" type="date" value={completionEstimatedDelivery} onChange={(event) => setCompletionEstimatedDelivery(event.target.value)} />
            </label>
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Descripción general / problema reportado</span>
              <textarea
                className="mt-1 min-h-28 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={technicalSummary}
                onChange={(event) => setTechnicalSummary(event.target.value)}
                placeholder="Describe el trabajo realizado y el alcance general de la intervención."
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Hallazgos del diagnóstico</span>
              <textarea
                className="mt-1 min-h-28 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={diagnosticFindings}
                onChange={(event) => setDiagnosticFindings(event.target.value)}
                placeholder="Fallas encontradas, códigos, mediciones o síntomas confirmados."
              />
            </label>
          </section>

          <section className="rounded-md border border-slate-200 p-4">
            <h3 className="font-bold text-slate-900">Checklist</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {[
                ["lights", "Luces"],
                ["tires", "Llantas"],
                ["mirrors", "Espejos"],
                ["documents", "Documentos"],
                ["tools", "Herramientas"],
                ["scratchesOrDents", "Rayones/golpes"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={completionChecklist[key as keyof typeof completionChecklist]}
                    onChange={(event) => {
                      setCompletionChecklist((current) => ({ ...current, [key]: event.target.checked }));
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Nivel de combustible</span>
                <select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={fuelLevel} onChange={(event) => setFuelLevel(event.target.value)}>
                  <option value="">Seleccionar</option>
                  <option value="Reserva">Reserva</option>
                  <option value="1/4">1/4</option>
                  <option value="1/2">1/2</option>
                  <option value="3/4">3/4</option>
                  <option value="Lleno">Lleno</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Objetos dentro del vehículo</span>
                <input className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={objectsInsideVehicle} onChange={(event) => setObjectsInsideVehicle(event.target.value)} placeholder="Ej. Ninguno, documentos, herramientas" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Notas del checklist</span>
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={checklistNotes} onChange={(event) => setChecklistNotes(event.target.value)} placeholder="Rayones, golpes, estado exterior/interior o novedades." />
              </label>
            </div>
          </section>

          <section className="rounded-md border border-slate-200 p-4">
            <h3 className="font-bold text-slate-900">Servicios / asignaciones</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
              <select
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={additionalServiceId}
                onChange={(event) => setAdditionalServiceId(event.target.value)}
              >
                <option value="">Seleccionar servicio disponible</option>
                {(workshopServicesQuery.data ?? []).map((service) => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
              <Button
                type="button"
                variant="secondary"
                disabled={!additionalServiceId}
                onClick={() => {
                  const service = (workshopServicesQuery.data ?? []).find((item) => item.id === additionalServiceId)?.name;
                  if (!service) return;
                  setSelectedServices((current) => [...new Set([...current, service])]);
                  setAdditionalServiceId("");
                }}
              >
                Añadir servicio
              </Button>
            </div>
            {workshopServicesQuery.isError ? <p className="mt-2 text-sm font-semibold text-red-600">No se pudieron cargar los servicios disponibles.</p> : null}
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {serviceOptions.map((service) => (
                <label key={service} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service)}
                      onChange={(event) => {
                        setSelectedServices((current) => event.target.checked ? [...new Set([...current, service])] : current.filter((item) => item !== service));
                      }}
                    />
                    {service}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Pruebas realizadas</span>
              <textarea
                className="mt-1 min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={testsPerformed}
                onChange={(event) => setTestsPerformed(event.target.value)}
                placeholder="Prueba de ruta, escaneo, encendido, frenado, luces, fugas, etc."
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Recomendación final</span>
              <textarea
                className="mt-1 min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={finalRecommendation}
                onChange={(event) => setFinalRecommendation(event.target.value)}
                placeholder="Indica si queda listo para aprobación, requiere seguimiento o hay advertencias."
              />
            </label>
          </section>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Observaciones adicionales</span>
            <textarea
              className="mt-1 min-h-20 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={completionObservations}
              onChange={(event) => setCompletionObservations(event.target.value)}
              placeholder="Notas internas, pendientes menores o contexto adicional."
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              disabled={completeMutation.isPending}
              onClick={() => {
                setOrderToComplete(null);
                setTechnicalSummary("");
                setDiagnosticFindings("");
                setTestsPerformed("");
                setFinalRecommendation("");
                setCompletionObservations("");
                setCompletionEntryDate("");
                setCompletionMileage("");
                setCompletionEstimatedDelivery("");
                setFuelLevel("");
                setObjectsInsideVehicle("");
                setChecklistNotes("");
                setCompletionChecklist({ lights: true, tires: true, mirrors: true, documents: true, tools: false, scratchesOrDents: false });
                setSelectedServices([]);
                setAdditionalServiceId("");
              }}
            >
              Cancelar
            </Button>
            <Button disabled={!canCompleteOrder} isLoading={completeMutation.isPending} onClick={() => completeMutation.mutate()}>
              Completar orden
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function ServiceOrdersListPage() {
  return <ServiceOrdersTablePage />;
}

export function ServiceOrdersPendingApprovalPage() {
  return <ServiceOrdersTablePage pendingClientApprovalOnly />;
}

export function ServiceOrdersCreatedPage() {
  return <ServiceOrdersTablePage createdOnly />;
}
