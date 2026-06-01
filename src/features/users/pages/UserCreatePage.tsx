import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ApiErrorAlert } from "../../../shared/components/feedback/ApiErrorAlert";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { usersService } from "../services/usersService";

function fieldClass() {
  return "mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100";
}

export function UserCreatePage() {
  const navigate = useNavigate();
  const documentTypes = useQuery({ queryKey: ["admin-user-document-types"], queryFn: usersService.listDocumentTypes });
  const roles = useQuery({ queryKey: ["admin-user-roles"], queryFn: () => usersService.listRoles({ pageNumber: 1, pageSize: 100 }) });
  const specialties = useQuery({ queryKey: ["admin-user-mechanic-specialties"], queryFn: usersService.listMechanicSpecialties });
  const [form, setForm] = useState({
    documentTypeId: "1",
    documentNumber: "",
    firstName: "",
    middleName: "",
    lastName: "",
    secondLastName: "",
    email: "",
    phone: "",
    password: "",
    roleId: "",
    mechanicSpecialtyId: "",
    isActive: true,
  });
  const selectedRole = useMemo(() => (roles.data?.data ?? []).find((role) => role.id === form.roleId), [form.roleId, roles.data?.data]);
  const isMechanic = selectedRole?.name === "Mechanic";
  const mutation = useMutation({
    mutationFn: () => usersService.create({
      documentTypeId: Number(form.documentTypeId),
      documentNumber: form.documentNumber,
      firstName: form.firstName,
      middleName: form.middleName || null,
      lastName: form.lastName,
      secondLastName: form.secondLastName || null,
      email: form.email,
      phone: form.phone || null,
      phoneCountryId: form.phone ? 1 : null,
      password: form.password,
      roleId: Number(form.roleId),
      mechanicSpecialtyId: isMechanic ? Number(form.mechanicSpecialtyId) : null,
      isActive: form.isActive,
    }),
    onSuccess: () => navigate("/users"),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <>
      <PageHeader
        title="Crear usuario"
        description="Alta de usuarios con rol, acceso y especialidad cuando aplica."
        actions={<Link to="/users"><Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>Regresar</Button></Link>}
      />
      {mutation.isError ? <ApiErrorAlert error={mutation.error} action="No se pudo crear el usuario" className="mb-4" /> : null}
      <Card className="p-5">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <label className="text-sm font-semibold text-slate-700">Tipo de documento<select className={fieldClass()} value={form.documentTypeId} onChange={(event) => setForm({ ...form, documentTypeId: event.target.value })}>{(documentTypes.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700">Número de documento<input className={fieldClass()} required value={form.documentNumber} onChange={(event) => setForm({ ...form, documentNumber: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700">Nombres<input className={fieldClass()} required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700">Segundo nombre<input className={fieldClass()} value={form.middleName} onChange={(event) => setForm({ ...form, middleName: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700">Apellidos<input className={fieldClass()} required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700">Segundo apellido<input className={fieldClass()} value={form.secondLastName} onChange={(event) => setForm({ ...form, secondLastName: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700">Correo<input className={fieldClass()} required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700">Teléfono<input className={fieldClass()} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700">Contraseña<input className={fieldClass()} required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700">Rol<select className={fieldClass()} required value={form.roleId} onChange={(event) => setForm({ ...form, roleId: event.target.value, mechanicSpecialtyId: "" })}><option value="">Seleccionar</option>{(roles.data?.data ?? []).map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700">Especialidad mecánico<select className={fieldClass()} required={isMechanic} disabled={!isMechanic} value={form.mechanicSpecialtyId} onChange={(event) => setForm({ ...form, mechanicSpecialtyId: event.target.value })}><option value="">Seleccionar</option>{(specialties.data ?? []).map((specialty) => <option key={specialty.id} value={specialty.id}>{specialty.name}</option>)}</select></label>
          <label className="flex items-center gap-2 pt-7 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Activo</label>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button type="button" variant="secondary" onClick={() => navigate("/users")}>Cancelar</Button>
            <Button type="submit" isLoading={mutation.isPending}>Guardar usuario</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
