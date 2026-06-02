import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { ApiErrorAlert } from "../../../shared/components/feedback/ApiErrorAlert";
import { FormInput } from "../../../shared/components/forms/FormInput";
import { FormSelect } from "../../../shared/components/forms/FormSelect";
import { FormTextarea } from "../../../shared/components/forms/FormTextarea";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { SelectOption } from "../../../shared/types/common";
import { partsService } from "../services/partsService";

const schema = z.object({
  partCategoryId: z.string().min(1, "Selecciona una categoría"),
  partBrandId: z.string().optional(),
  code: z.string().trim().min(2, "Ingresa el código interno").max(50, "Máximo 50 caracteres"),
  description: z.string().trim().min(3, "Ingresa la descripción").max(255, "Máximo 255 caracteres"),
  minimumStock: z.coerce.number().min(0, "No puede ser negativo"),
  unitPrice: z.coerce.number().min(0, "No puede ser negativo"),
  isActive: z.string().min(1, "Selecciona el estado"),
});

type Values = z.infer<typeof schema>;

function options(items?: Record<string, unknown>[]): SelectOption[] {
  return (items ?? []).map((item) => ({
    value: String(item.id ?? item.Id ?? ""),
    label: String(item.name ?? item.Name ?? "Sin nombre"),
  }));
}

function numberValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function PartFormPage({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { id = "" } = useParams();
  const isEdit = mode === "edit";
  const returnTo = searchParams.get("returnTo");
  const backPath = returnTo && returnTo.startsWith("/") ? returnTo : "/parts";

  const categories = useQuery({ queryKey: ["part-form-categories"], queryFn: partsService.categories });
  const brands = useQuery({ queryKey: ["part-form-brands"], queryFn: partsService.brands });
  const part = useQuery({ queryKey: ["part-form-product", id], queryFn: () => partsService.inventoryProduct(id), enabled: isEdit && Boolean(id) });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      partCategoryId: "",
      partBrandId: "",
      code: "",
      description: "",
      minimumStock: 0,
      unitPrice: 0,
      isActive: "true",
    },
  });

  useEffect(() => {
    if (!part.data) return;
    reset({
      partCategoryId: String(part.data.partCategoryId ?? part.data.PartCategoryId ?? ""),
      partBrandId: part.data.partBrandId ?? part.data.PartBrandId ? String(part.data.partBrandId ?? part.data.PartBrandId) : "",
      code: String(part.data.code ?? part.data.Code ?? ""),
      description: String(part.data.description ?? part.data.Description ?? ""),
      minimumStock: numberValue(part.data.minimumStock ?? part.data.MinimumStock),
      unitPrice: numberValue(part.data.unitPrice ?? part.data.UnitPrice),
      isActive: String(Boolean(part.data.isActive ?? part.data.IsActive ?? true)),
    });
  }, [part.data, reset]);

  const mutation = useMutation({
    mutationFn: (values: Values) => {
      const payload = {
        partCategoryId: Number(values.partCategoryId),
        partBrandId: values.partBrandId ? Number(values.partBrandId) : null,
        code: values.code.trim().toUpperCase(),
        description: values.description.trim(),
        minimumStock: Number(values.minimumStock),
        unitPrice: Number(values.unitPrice),
        isActive: values.isActive === "true",
      };
      return isEdit ? partsService.update(id, payload) : partsService.create(payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["stock-parts"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-products"] }),
        queryClient.invalidateQueries({ queryKey: ["parts"] }),
      ]);
      navigate(backPath);
    },
  });

  const title = isEdit ? "Editar repuesto" : "Crear repuesto";

  return (
    <>
      <PageHeader
        title={title}
        description="Datos maestros del repuesto, precio de venta, stock mínimo y estado operativo."
        actions={<Link to={backPath}><Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>Regresar</Button></Link>}
      />
      {mutation.isError ? <ApiErrorAlert error={mutation.error} action="No se pudo guardar el repuesto" className="mb-4" /> : null}
      {part.isError ? <ApiErrorAlert error={part.error} action="No se pudo cargar el repuesto" className="mb-4" /> : null}

      <Card className="overflow-hidden">
        <div className="atm-shop-stripe h-1" />
        <form className="grid gap-5 p-5" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <section className="grid gap-4 md:grid-cols-2">
            <h2 className="text-base font-black text-slate-950 md:col-span-2">Identificación</h2>
            <FormInput label="Código interno" registration={register("code")} error={errors.code} placeholder="REF-FIL-ACE-UNI" />
            <FormSelect label="Categoría" registration={register("partCategoryId")} error={errors.partCategoryId} options={options(categories.data)} />
            <FormSelect label="Marca (opcional)" registration={register("partBrandId")} error={errors.partBrandId} options={options(brands.data)} />
            <FormSelect
              label="Estado"
              registration={register("isActive")}
              error={errors.isActive}
              options={[
                { value: "true", label: "Activo" },
                { value: "false", label: "Inactivo" },
              ]}
            />
            <div className="md:col-span-2">
              <FormTextarea label="Descripción" registration={register("description")} error={errors.description} placeholder="Nombre comercial y especificación del repuesto" />
            </div>
          </section>

          <section className="grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2">
            <h2 className="text-base font-black text-slate-950 md:col-span-2">Stock y precio</h2>
            <FormInput label="Stock mínimo" type="number" min={0} registration={register("minimumStock")} error={errors.minimumStock} />
            <FormInput label="Precio de venta" type="number" min={0} step="0.01" registration={register("unitPrice")} error={errors.unitPrice} />
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 md:col-span-2">
              El stock actual se controla desde movimientos de entrada y salida en la vista de inventario operativo.
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={() => navigate(backPath)}>Cancelar</Button>
            <Button type="submit" isLoading={mutation.isPending} icon={<Save className="h-4 w-4" />}>Guardar repuesto</Button>
          </div>
        </form>
      </Card>
    </>
  );
}

export function PartCreatePage() {
  return <PartFormPage mode="create" />;
}
