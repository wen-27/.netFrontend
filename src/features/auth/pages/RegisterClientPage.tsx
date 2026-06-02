import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { FormInput } from "../../../shared/components/forms/FormInput";
import { FormSelect } from "../../../shared/components/forms/FormSelect";
import { authService } from "../services/authService";
import { AuthShell } from "../components/AuthShell";

const schema = z.object({
  documentType: z.string().min(1, "Selecciona un tipo de documento"),
  documentNumber: z.string().min(5, "Ingresa el número de documento"),
  firstName: z.string().min(2, "Ingresa el nombre"),
  lastName: z.string().min(2, "Ingresa el apellido"),
  birthDate: z.string().min(1, "Selecciona una fecha"),
  genderId: z.string().min(1, "Selecciona un género"),
  email: z.string().email("Ingresa un email válido"),
  phone: z.string().min(7, "Ingresa un teléfono válido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Las contraseñas no coinciden" });

type Values = z.infer<typeof schema>;

export function RegisterClientPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setServerError("");
    try {
      await authService.registerClient({
        documentTypeId: Number(values.documentType),
        documentNumber: values.documentNumber,
        firstName: values.firstName,
        middleName: null,
        lastName: values.lastName,
        secondLastName: null,
        birthDate: values.birthDate,
        genderId: Number(values.genderId),
        addressId: null,
        email: values.email,
        password: values.password,
        phoneCountryId: 1,
        phoneNumber: values.phone,
      });
      navigate("/auth/login", { replace: true });
    } catch {
      setServerError("No fue posible registrar el cliente en este momento.");
    }
  }

  return (
    <AuthShell title="Registro de cliente" description="Crea tu acceso para consultar órdenes, aprobaciones, mensajes y pagos." wide>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <FormSelect label="Tipo de documento" registration={register("documentType")} error={errors.documentType} options={[{ label: "Cédula", value: "1" }, { label: "NIT", value: "2" }, { label: "Pasaporte", value: "3" }]} />
          <FormInput label="Número de documento" registration={register("documentNumber")} error={errors.documentNumber} />
          <FormInput label="Nombre" registration={register("firstName")} error={errors.firstName} />
          <FormInput label="Apellido" registration={register("lastName")} error={errors.lastName} />
          <FormInput label="Fecha de nacimiento" type="date" registration={register("birthDate")} error={errors.birthDate} />
          <FormSelect label="Género" registration={register("genderId")} error={errors.genderId} options={[{ label: "Femenino", value: "1" }, { label: "Masculino", value: "2" }, { label: "Otro", value: "3" }]} />
          <FormInput label="Email" type="email" autoComplete="email" registration={register("email")} error={errors.email} />
          <FormInput label="Teléfono" autoComplete="tel" registration={register("phone")} error={errors.phone} />
          <FormInput label="Contraseña" type="password" autoComplete="new-password" registration={register("password")} error={errors.password} />
          <FormInput label="Confirmar contraseña" type="password" autoComplete="new-password" registration={register("confirmPassword")} error={errors.confirmPassword} />
          {serverError ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700 md:col-span-2">{serverError}</p> : null}
          <div className="flex items-center justify-between md:col-span-2">
            <Link className="text-sm font-semibold text-slate-600 hover:underline" to="/auth/login">Volver a login</Link>
            <Button type="submit" isLoading={isSubmitting}>Crear cuenta</Button>
          </div>
        </form>
    </AuthShell>
  );
}
