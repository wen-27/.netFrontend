import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
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
};

export function FormShell({ title, description, primaryLabel = "Nombre", secondaryLabel = "Referencia" }: FormShellProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: "Activo" },
  });

  return (
    <>
      <PageHeader title={title} description={description} />
      <Card className="p-5">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(() => undefined)}>
          <FormInput label={primaryLabel} registration={register("first")} error={errors.first} />
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
          <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-2 border-t border-slate-200 bg-white p-4 md:col-span-2">
            <Button variant="secondary" type="button">Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting} icon={<Save className="h-4 w-4" />}>Guardar</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
