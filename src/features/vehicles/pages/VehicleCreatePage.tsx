import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { ApiErrorAlert } from "../../../shared/components/feedback/ApiErrorAlert";
import { FormInput } from "../../../shared/components/forms/FormInput";
import { FormSelect } from "../../../shared/components/forms/FormSelect";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { SelectOption } from "../../../shared/types/common";
import { catalogsService } from "../../catalogs/services/catalogsService";
import { personsService } from "../../persons/services/personsService";
import { vehiclesService } from "../services/vehiclesService";

const currentYear = new Date().getFullYear();

const schema = z.object({
  ownerPersonId: z.string().min(1, "Selecciona el propietario"),
  modelId: z.string().min(1, "Selecciona el modelo"),
  vehicleTypeId: z.string().min(1, "Selecciona el tipo"),
  plate: z.string().min(5, "Ingresa la placa").max(10, "Máximo 10 caracteres"),
  vin: z.string().min(17, "El VIN debe tener 17 caracteres").max(17, "El VIN debe tener 17 caracteres"),
  year: z.coerce.number().min(1886, "Año inválido").max(currentYear + 1, "Año inválido"),
  color: z.string().optional(),
  mileage: z.coerce.number().min(0, "El kilometraje no puede ser negativo"),
  startDate: z.string().optional(),
});

type Values = z.infer<typeof schema>;

function catalogOptions(items?: { id: string; name: string; code?: string }[]): SelectOption[] {
  return (items ?? []).map((item) => ({ value: item.id, label: item.code ? `${item.code} · ${item.name}` : item.name }));
}

export function VehicleCreatePage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { year: currentYear, mileage: 0, startDate: new Date().toISOString().slice(0, 10) },
  });

  const clients = useQuery({ queryKey: ["vehicle-form-clients"], queryFn: () => personsService.list({ pageNumber: 1, pageSize: 200 }) });
  const models = useQuery({ queryKey: ["vehicle-form-models"], queryFn: () => catalogsService.list("/api/vehiclemodels", { pageNumber: 1, pageSize: 200 }) });
  const types = useQuery({ queryKey: ["vehicle-form-types"], queryFn: () => catalogsService.list("/api/vehicletypes", { pageNumber: 1, pageSize: 100 }) });

  const clientOptions: SelectOption[] = (clients.data?.data ?? []).map((client) => ({
    value: client.id,
    label: `${client.fullName} · ${client.documentType} ${client.documentNumber}`,
  }));

  const mutation = useMutation({
    mutationFn: (values: Values) => vehiclesService.createWithOwner({
      ownerPersonId: Number(values.ownerPersonId),
      modelId: Number(values.modelId),
      vehicleTypeId: Number(values.vehicleTypeId),
      plate: values.plate.trim().toUpperCase(),
      vin: values.vin.trim().toUpperCase(),
      year: Number(values.year),
      color: values.color?.trim() || null,
      mileage: Number(values.mileage),
      startDate: values.startDate || null,
    }),
    onSuccess: () => navigate("/vehicles"),
  });

  return (
    <>
      <PageHeader title="Registrar vehículo" description="Crea el vehículo con sus datos obligatorios y asígnalo a un cliente activo del sistema." />
      {mutation.error ? <ApiErrorAlert error={mutation.error} action="No se pudo registrar el vehículo" className="mb-4" /> : null}
      <Card className="overflow-hidden">
        <div className="atm-shop-stripe h-1" />
        <form className="grid gap-5 p-5" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <section className="grid gap-4 md:grid-cols-2">
            <h2 className="text-base font-black text-slate-950 md:col-span-2">Datos técnicos</h2>
            <FormInput label="Placa" registration={register("plate")} error={errors.plate} />
            <FormInput label="VIN" registration={register("vin")} error={errors.vin} />
            <FormSelect label="Modelo" registration={register("modelId")} error={errors.modelId} options={catalogOptions(models.data?.data)} />
            <FormSelect label="Tipo de vehículo" registration={register("vehicleTypeId")} error={errors.vehicleTypeId} options={catalogOptions(types.data?.data)} />
            <FormInput label="Año" type="number" registration={register("year")} error={errors.year} />
            <FormInput label="Color (opcional)" registration={register("color")} error={errors.color} />
            <FormInput label="Kilometraje" type="number" registration={register("mileage")} error={errors.mileage} />
          </section>

          <section className="grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2">
            <h2 className="text-base font-black text-slate-950 md:col-span-2">Propietario</h2>
            <FormSelect label="Cliente propietario" registration={register("ownerPersonId")} error={errors.ownerPersonId} options={clientOptions} />
            <FormInput label="Fecha inicio de propiedad" type="date" registration={register("startDate")} error={errors.startDate} />
          </section>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={() => navigate("/vehicles")}>Cancelar</Button>
            <Button type="submit" isLoading={mutation.isPending} icon={<Save className="h-4 w-4" />}>Registrar vehículo</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
