import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPaginated } from "../../../services/apiClient";
import { ApiErrorAlert } from "../../../shared/components/feedback/ApiErrorAlert";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { formatCurrency } from "../../../shared/utils/formatters";
import { serviceOrdersService } from "../../service-orders/services/serviceOrdersService";
import { getMechanicsBySpecialty, getWorkshopServices } from "../services/operationsService";

type ApiPerson = {
  id?: number;
  Id?: number;
  firstNames?: string;
  FirstNames?: string;
  firstName?: string;
  FirstName?: string;
  middleName?: string | null;
  MiddleName?: string | null;
  lastNames?: string;
  LastNames?: string;
  lastName?: string;
  LastName?: string;
  secondLastName?: string | null;
  SecondLastName?: string | null;
};

type ApiVehicle = {
  id?: number;
  Id?: number;
  vin?: string;
  VIN?: string;
  year?: number;
  Year?: number;
  mileage?: number;
  Mileage?: number;
  isActive?: boolean;
  IsActive?: boolean;
  brand?: string;
  model?: string;
};

type ApiOwnerHistory = {
  vehicleId?: number;
  VehicleId?: number;
  personId?: number;
  PersonId?: number;
  endDate?: string | null;
  EndDate?: string | null;
};

type ApiServiceOrder = {
  vehicleId?: number | string;
  VehicleId?: number | string;
  orderStatusId?: number | string;
  OrderStatusId?: number | string;
  status?: string | null;
  Status?: string | null;
};

type SelectedService = {
  workshopServiceId: string;
  specialtyName: string;
  specialtyId: number;
  mechanicPersonId: string;
  observation: string;
};

const blockingOrderStatuses = new Set(["Created", "PendingAssignment", "Assigned", "InProgress", "PendingClientApproval", "WaitingForPayment", "PaymentUnderReview", "Paid", "ReadyForDelivery"]);
const statusById: Record<string, string> = { "1": "Created", "2": "PendingAssignment", "3": "Assigned", "4": "InProgress", "5": "PendingClientApproval", "6": "WaitingForPayment", "7": "PaymentUnderReview", "8": "Paid", "9": "ReadyForDelivery", "10": "Delivered", "11": "Cancelled" };
const serviceTypeBySpecialty: Record<string, number> = { "Mantenimiento": 1, "Electricista": 5, "Frenos": 2, "Diagnóstico": 3 };

function fieldClass() {
  return "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
}

function personName(person?: ApiPerson) {
  if (!person) return "";
  const fullName = [person.firstNames ?? person.FirstNames, person.lastNames ?? person.LastNames].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;
  return [person.firstName ?? person.FirstName, person.middleName ?? person.MiddleName, person.lastName ?? person.LastName, person.secondLastName ?? person.SecondLastName].filter(Boolean).join(" ");
}

function vehicleName(vehicle?: ApiVehicle) {
  if (!vehicle) return "";
  const year = vehicle.year ?? vehicle.Year;
  const vin = vehicle.vin ?? vehicle.VIN;
  return [vehicle.brand, vehicle.model, year].filter(Boolean).join(" ") || `Vehículo #${vehicle.id ?? vehicle.Id}${vin ? ` · ${vin}` : ""}`;
}

function serviceSpecialty(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("freno")) return "Frenos";
  if (normalized.includes("el")) return "Electricista";
  return "Mantenimiento";
}

export function MechanicDiagnosticOrderCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [clientId, setClientId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(() => new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16));
  const [mileage, setMileage] = useState(0);
  const [problemDescription, setProblemDescription] = useState("");
  const [observations, setObservations] = useState("");
  const [checklist, setChecklist] = useState({ lights: false, tires: false, mirrors: false, documents: false, tools: false, scratchesOrDents: false, fuelLevel: "", objectsInsideVehicle: "", notes: "" });
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [error, setError] = useState("");

  const personsQuery = useQuery({ queryKey: ["diagnostic-order-persons"], queryFn: () => getPaginated<ApiPerson>("/api/persons", { pageNumber: 1, pageSize: 200 }) });
  const vehiclesQuery = useQuery({ queryKey: ["diagnostic-order-vehicles"], queryFn: () => getPaginated<ApiVehicle>("/api/vehicles", { pageNumber: 1, pageSize: 500 }) });
  const ownerHistoryQuery = useQuery({ queryKey: ["diagnostic-order-owner-history"], queryFn: () => getPaginated<ApiOwnerHistory>("/api/vehicleownerhistory", { pageNumber: 1, pageSize: 500 }) });
  const serviceOrdersQuery = useQuery({ queryKey: ["diagnostic-order-service-orders"], queryFn: () => getPaginated<ApiServiceOrder>("/api/serviceorders", { pageNumber: 1, pageSize: 1000 }) });
  const servicesQuery = useQuery({ queryKey: ["diagnostic-workshop-services"], queryFn: getWorkshopServices });
  const mechanicQueries = {
    Mantenimiento: useQuery({ queryKey: ["mechanics-by-specialty", "Mantenimiento"], queryFn: () => getMechanicsBySpecialty("Mantenimiento") }),
    Electricista: useQuery({ queryKey: ["mechanics-by-specialty", "Electricista"], queryFn: () => getMechanicsBySpecialty("Electricista") }),
    Frenos: useQuery({ queryKey: ["mechanics-by-specialty", "Frenos"], queryFn: () => getMechanicsBySpecialty("Frenos") }),
  };

  const people = personsQuery.data?.data ?? [];
  const vehicles = vehiclesQuery.data?.data ?? [];
  const ownerHistory = ownerHistoryQuery.data?.data ?? [];
  const serviceOrders = serviceOrdersQuery.data?.data ?? [];
  const services = (servicesQuery.data ?? []).filter((service) => service.status === "Active");
  const selectedClient = people.find((person) => String(person.id ?? person.Id) === clientId);
  const selectedVehicle = vehicles.find((vehicle) => String(vehicle.id ?? vehicle.Id) === vehicleId);

  const activeOrderVehicleIds = useMemo(() => new Set(serviceOrders.filter((order) => {
    const statusId = String(order.orderStatusId ?? order.OrderStatusId ?? "");
    return blockingOrderStatuses.has(String(order.status ?? order.Status ?? statusById[statusId] ?? ""));
  }).map((order) => String(order.vehicleId ?? order.VehicleId)).filter(Boolean)), [serviceOrders]);
  const vehiclesById = useMemo(() => new Map(vehicles.map((vehicle) => [String(vehicle.id ?? vehicle.Id), vehicle])), [vehicles]);
  const availableVehicleIdsByClient = useMemo(() => {
    const grouped = new Map<string, Set<string>>();
    ownerHistory.filter((item) => !(item.endDate ?? item.EndDate)).forEach((item) => {
      const personId = String(item.personId ?? item.PersonId ?? "");
      const ownerVehicleId = String(item.vehicleId ?? item.VehicleId ?? "");
      const vehicle = vehiclesById.get(ownerVehicleId);
      if (!personId || !ownerVehicleId || !vehicle || !(vehicle.isActive ?? vehicle.IsActive ?? true) || activeOrderVehicleIds.has(ownerVehicleId)) return;
      const ids = grouped.get(personId) ?? new Set<string>();
      ids.add(ownerVehicleId);
      grouped.set(personId, ids);
    });
    return grouped;
  }, [activeOrderVehicleIds, ownerHistory, vehiclesById]);
  const availablePeople = people.filter((person) => availableVehicleIdsByClient.has(String(person.id ?? person.Id)));
  const availableVehicles = vehicles.filter((vehicle) => (availableVehicleIdsByClient.get(clientId) ?? new Set<string>()).has(String(vehicle.id ?? vehicle.Id)));

  const createMutation = useMutation({
    mutationFn: () => serviceOrdersService.createDiagnostic({
      clientPersonId: Number(clientId),
      vehicleId: Number(vehicleId),
      entryDate: new Date(entryDate).toISOString(),
      mileage: Number(mileage),
      problemDescription,
      observations,
      estimatedDeliveryDate: new Date(estimatedDeliveryDate).toISOString(),
      checklist,
      serviceAssignments: selectedServices.map((item) => {
        const service = services.find((current) => current.id === item.workshopServiceId);
        return {
          serviceTypeId: serviceTypeBySpecialty[item.specialtyName] ?? 1,
          workshopServiceId: Number(item.workshopServiceId),
          specialtyId: item.specialtyId,
          mechanicPersonId: Number(item.mechanicPersonId),
          observation: item.observation,
          laborCost: service?.laborValue ?? 0,
        };
      }),
    }),
    onSuccess: (response) => {
      const id = (response.data as { id?: number }).id;
      navigate(id ? `/mechanic/diagnostics?orderId=${id}` : "/mechanic/diagnostics");
    },
  });

  function goNext() {
    setError("");
    if (step === 1 && (!clientId || !vehicleId)) return setError("Selecciona un cliente y un vehículo disponible.");
    if (step === 2 && (!entryDate || !estimatedDeliveryDate || mileage < 0 || !problemDescription.trim() || !observations.trim() || !selectedClient || !selectedVehicle)) return setError("Completa la información básica obligatoria.");
    if (step === 3 && (!checklist.fuelLevel.trim() || !checklist.objectsInsideVehicle.trim())) return setError("Completa el checklist de llegada del vehículo.");
    setStep((current) => Math.min(current + 1, 4));
  }

  function addService() {
    const service = services.find((item) => item.id === serviceId);
    if (!service) return;
    const specialtyName = serviceSpecialty(service.category);
    const mechanic = mechanicQueries[specialtyName as keyof typeof mechanicQueries].data?.[0];
    if (!mechanic) {
      setError(`No hay mecánicos registrados para ${specialtyName}.`);
      return;
    }
    setSelectedServices((current) => [...current, { workshopServiceId: service.id, specialtyName, specialtyId: mechanic.specialtyId, mechanicPersonId: String(mechanic.personId), observation: service.description }]);
    setServiceId("");
    setError("");
  }

  return (
    <>
      <PageHeader title="Crear orden de diagnóstico" description="Flujo guiado con cliente, vehículo, checklist y servicios asignados por especialidad." />
      {error ? <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
      {createMutation.error ? <ApiErrorAlert error={createMutation.error} action="No se pudo crear la orden de diagnóstico" className="mb-4" /> : null}

      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        {["Cliente y vehículo", "Información", "Checklist", "Servicios"].map((label, index) => (
          <div key={label} className={`rounded-md border px-3 py-2 text-sm font-bold ${step === index + 1 ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500"}`}>
            {index + 1}. {label}
          </div>
        ))}
      </div>

      <Card className="p-5">
        {step === 1 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label><span className="text-sm font-semibold text-slate-700">Cliente</span><select className={fieldClass()} value={clientId} onChange={(event) => { setClientId(event.target.value); setVehicleId(""); }}><option value="">Seleccionar</option>{availablePeople.map((person) => <option key={person.id ?? person.Id} value={person.id ?? person.Id}>{personName(person)}</option>)}</select></label>
            <label><span className="text-sm font-semibold text-slate-700">Vehículo disponible</span><select className={fieldClass()} value={vehicleId} onChange={(event) => { setVehicleId(event.target.value); const vehicle = vehicles.find((item) => String(item.id ?? item.Id) === event.target.value); setMileage(Number(vehicle?.mileage ?? vehicle?.Mileage ?? 0)); }} disabled={!clientId}><option value="">Seleccionar</option>{availableVehicles.map((vehicle) => <option key={vehicle.id ?? vehicle.Id} value={vehicle.id ?? vehicle.Id}>{vehicleName(vehicle)}</option>)}</select></label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label><span className="text-sm font-semibold text-slate-700">Fecha de ingreso</span><input className={fieldClass()} type="datetime-local" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} /></label>
            <label><span className="text-sm font-semibold text-slate-700">Entrega estimada</span><input className={fieldClass()} type="datetime-local" value={estimatedDeliveryDate} onChange={(event) => setEstimatedDeliveryDate(event.target.value)} /></label>
            <label><span className="text-sm font-semibold text-slate-700">Kilometraje</span><input className={fieldClass()} type="number" min={0} value={mileage} onChange={(event) => setMileage(Number(event.target.value))} /></label>
            <Info label="Propietario" value={personName(selectedClient)} />
            <Info label="Marca" value={selectedVehicle?.brand ?? ""} />
            <Info label="Modelo" value={selectedVehicle?.model ?? ""} />
            <label className="md:col-span-2"><span className="text-sm font-semibold text-slate-700">Motivo de ingreso</span><textarea className={fieldClass()} value={problemDescription} onChange={(event) => setProblemDescription(event.target.value)} /></label>
            <label className="md:col-span-2"><span className="text-sm font-semibold text-slate-700">Observaciones</span><textarea className={fieldClass()} value={observations} onChange={(event) => setObservations(event.target.value)} /></label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {(["lights", "tires", "mirrors", "documents", "tools", "scratchesOrDents"] as const).map((key) => <label key={key} className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={checklist[key]} onChange={(event) => setChecklist((current) => ({ ...current, [key]: event.target.checked }))} />{key === "scratchesOrDents" ? "Rayones o golpes" : key}</label>)}
            <label><span className="text-sm font-semibold text-slate-700">Nivel de combustible</span><input className={fieldClass()} value={checklist.fuelLevel} onChange={(event) => setChecklist((current) => ({ ...current, fuelLevel: event.target.value }))} /></label>
            <label><span className="text-sm font-semibold text-slate-700">Objetos dentro del vehículo</span><input className={fieldClass()} value={checklist.objectsInsideVehicle} onChange={(event) => setChecklist((current) => ({ ...current, objectsInsideVehicle: event.target.value }))} /></label>
            <label className="md:col-span-2"><span className="text-sm font-semibold text-slate-700">Notas</span><textarea className={fieldClass()} value={checklist.notes} onChange={(event) => setChecklist((current) => ({ ...current, notes: event.target.value }))} /></label>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <select className={fieldClass()} value={serviceId} onChange={(event) => setServiceId(event.target.value)}><option value="">Seleccionar servicio del taller</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name} · {service.category} · {formatCurrency(service.finalPrice)}</option>)}</select>
              <Button type="button" onClick={addService}>Agregar</Button>
            </div>
            {selectedServices.map((item, index) => {
              const service = services.find((current) => current.id === item.workshopServiceId);
              const mechanics = mechanicQueries[item.specialtyName as keyof typeof mechanicQueries].data ?? [];
              return (
                <div key={`${item.workshopServiceId}-${index}`} className="rounded-md border border-slate-200 p-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <Info label="Servicio" value={service?.name ?? ""} />
                    <Info label="Especialidad" value={item.specialtyName} />
                    <label><span className="text-xs font-bold uppercase text-slate-400">Mecánico responsable</span><select className={fieldClass()} value={item.mechanicPersonId} onChange={(event) => setSelectedServices((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, mechanicPersonId: event.target.value, specialtyId: mechanics.find((mechanic) => String(mechanic.personId) === event.target.value)?.specialtyId ?? row.specialtyId } : row))}>{mechanics.map((mechanic) => <option key={mechanic.personId} value={mechanic.personId}>{mechanic.fullName}</option>)}</select></label>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          {step > 1 ? <Button variant="secondary" onClick={() => setStep((current) => current - 1)}>Atrás</Button> : null}
          {step < 4 ? <Button onClick={goNext}>Continuar</Button> : <Button icon={<CheckCircle2 className="h-4 w-4" />} disabled={!selectedServices.length || selectedServices.some((service) => !service.mechanicPersonId) || createMutation.isPending} onClick={() => createMutation.mutate()}>Crear orden</Button>}
        </div>
      </Card>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value || "Pendiente"}</p></div>;
}
