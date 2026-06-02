import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { FormInput } from "../forms/FormInput";
import { FormSelect } from "../forms/FormSelect";
import { FormTextarea } from "../forms/FormTextarea";
import { PageHeader } from "./PageHeader";

const formSchema = z.object({
  first: z.string().min(2, "Campo obligatorio"),
  second: z.string().min(2, "Campo obligatorio"),
  status: z.string().min(1, "Selecciona un estado"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type FormShellProps = {
  title: string;
  description: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  cancelTo?: string;
  showPrimary?: boolean;
};

export function FormShell({ title, description, primaryLabel = "Nombre", secondaryLabel = "Referencia", cancelTo, showPrimary = true }: FormShellProps) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { first: showPrimary ? "" : "No editable", status: "Activo" },
  });

  return (
    <>
      <PageHeader title={title} description={description} />
      <Card className="overflow-hidden">
        <div className="atm-shop-stripe h-1" />
        <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-slate-950">Información operativa</h2>
              <p className="text-sm font-medium text-slate-500">Completa los campos requeridos para guardar el registro.</p>
            </div>
          </div>
        </div>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(() => undefined)}>
          <div className="grid gap-4 p-5 md:col-span-2 md:grid-cols-2">
            {showPrimary ? <FormInput label={primaryLabel} registration={register("first")} error={errors.first} /> : null}
            <FormInput label={secondaryLabel} registration={register("second")} error={errors.second} />
            <FormSelect
              label="Estado"
              registration={register("status")}
              error={errors.status}
              options={[
                { label: "Activo", value: "Activo" },
                { label: "Inactivo", value: "Inactivo" },
                { label: "Pendiente", value: "Pendiente" },
              ]}
            />
            <div className="md:col-span-2">
              <FormTextarea label="Observaciones" registration={register("notes")} error={errors.notes} />
            </div>
          </div>
          <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white/95 p-4 backdrop-blur md:col-span-2">
            <Button variant="secondary" type="button" onClick={() => (cancelTo ? navigate(cancelTo) : navigate(-1))}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting} icon={<Save className="h-4 w-4" />}>Guardar</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
