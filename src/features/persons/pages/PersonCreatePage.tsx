import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { ApiErrorAlert } from "../../../shared/components/feedback/ApiErrorAlert";
import { FormInput } from "../../../shared/components/forms/FormInput";
import { FormSelect } from "../../../shared/components/forms/FormSelect";
import { FormTextarea } from "../../../shared/components/forms/FormTextarea";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { SelectOption } from "../../../shared/types/common";
import { catalogsService } from "../../catalogs/services/catalogsService";
import { personsService } from "../services/personsService";

const schema = z.object({
  documentTypeId: z.string().min(1, "Selecciona un tipo de documento"),
  documentNumber: z.string().min(5, "Ingresa el documento"),
  firstName: z.string().min(2, "Ingresa el nombre"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Ingresa el apellido"),
  secondLastName: z.string().optional(),
  birthDate: z.string().optional(),
  genderId: z.string().optional(),
  email: z.string().email("Ingresa un email válido"),
  phoneCountryId: z.string().optional(),
  phoneNumber: z.string().optional(),
  addressText: z.string().optional(),
  password: z.string().min(8, "Mínimo 8 caracteres"),
}).refine((data) => !data.phoneNumber || Boolean(data.phoneCountryId), {
  path: ["phoneCountryId"],
  message: "Selecciona país si registras teléfono",
});

type Values = z.infer<typeof schema>;

function optionsFrom(items?: { id: string; name: string; code?: string }[]): SelectOption[] {
  return (items ?? []).map((item) => ({ value: item.id, label: item.code ? `${item.code} · ${item.name}` : item.name }));
}

export function PersonCreatePage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "DevPass123!" },
  });

  const documentTypes = useQuery({ queryKey: ["client-form-document-types"], queryFn: () => catalogsService.list("/api/documenttypes", { pageNumber: 1, pageSize: 50 }) });
  const genders = useQuery({ queryKey: ["client-form-genders"], queryFn: () => catalogsService.list("/api/genders", { pageNumber: 1, pageSize: 50 }) });
  const countries = useQuery({ queryKey: ["client-form-countries"], queryFn: () => catalogsService.list("/api/countries", { pageNumber: 1, pageSize: 50 }) });

  const mutation = useMutation({
    mutationFn: (values: Values) => personsService.createClient({
      documentTypeId: Number(values.documentTypeId),
      documentNumber: values.documentNumber,
      firstName: values.firstName,
      middleName: values.middleName?.trim() || null,
      lastName: values.lastName,
      secondLastName: values.secondLastName?.trim() || null,
      birthDate: values.birthDate || null,
      genderId: values.genderId ? Number(values.genderId) : null,
      addressId: null,
      addressText: values.addressText?.trim() || null,
      email: values.email,
      password: values.password,
      phoneCountryId: values.phoneNumber ? Number(values.phoneCountryId) : null,
      phoneNumber: values.phoneNumber?.trim() || null,
    }),
    onSuccess: () => navigate("/persons"),
  });

  return (
    <>
      <PageHeader title="Crear cliente" description="Registra datos personales, contacto, acceso y rol Client para operar órdenes y vehículos." />
      {mutation.error ? <ApiErrorAlert error={mutation.error} action="No se pudo crear el cliente" className="mb-4" /> : null}
      <Card className="overflow-hidden">
        <div className="atm-shop-stripe h-1" />
        <form className="grid gap-5 p-5" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <section className="grid gap-4 md:grid-cols-2">
            <h2 className="text-base font-black text-slate-950 md:col-span-2">Identificación</h2>
            <FormSelect label="Tipo de documento" registration={register("documentTypeId")} error={errors.documentTypeId} options={optionsFrom(documentTypes.data?.data)} />
            <FormInput label="Número de documento" registration={register("documentNumber")} error={errors.documentNumber} />
            <FormInput label="Primer nombre" registration={register("firstName")} error={errors.firstName} />
            <FormInput label="Segundo nombre (opcional)" registration={register("middleName")} error={errors.middleName} />
            <FormInput label="Primer apellido" registration={register("lastName")} error={errors.lastName} />
            <FormInput label="Segundo apellido (opcional)" registration={register("secondLastName")} error={errors.secondLastName} />
            <FormInput label="Fecha de nacimiento (opcional)" type="date" registration={register("birthDate")} error={errors.birthDate} />
            <FormSelect label="Género (opcional)" registration={register("genderId")} error={errors.genderId} options={optionsFrom(genders.data?.data)} />
          </section>

          <section className="grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2">
            <h2 className="text-base font-black text-slate-950 md:col-span-2">Contacto y acceso</h2>
            <FormInput label="Email" type="email" autoComplete="email" registration={register("email")} error={errors.email} />
            <FormInput label="Contraseña temporal" type="text" registration={register("password")} error={errors.password} />
            <FormSelect label="País teléfono (opcional)" registration={register("phoneCountryId")} error={errors.phoneCountryId} options={optionsFrom(countries.data?.data)} />
            <FormInput label="Teléfono (opcional)" autoComplete="tel" registration={register("phoneNumber")} error={errors.phoneNumber} />
            <div className="md:col-span-2">
              <FormTextarea label="Dirección (opcional)" registration={register("addressText")} error={errors.addressText} />
            </div>
          </section>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={() => navigate("/persons")}>Cancelar</Button>
            <Button type="submit" isLoading={mutation.isPending} icon={<Save className="h-4 w-4" />}>Crear cliente</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
