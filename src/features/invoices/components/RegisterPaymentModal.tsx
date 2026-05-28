import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "../../../shared/components/forms/FormInput";
import { FormSelect } from "../../../shared/components/forms/FormSelect";
import { Button } from "../../../shared/components/ui/Button";
import { Modal } from "../../../shared/components/ui/Modal";

const schema = z.object({
  method: z.string().min(1, "Selecciona un método"),
  amount: z.coerce.number().positive("Ingresa un valor válido"),
  lastFourDigits: z.string().max(4, "Solo últimos 4 dígitos").optional(),
  holder: z.string().optional(),
  franchise: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function RegisterPaymentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { register, watch, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });
  const isCard = watch("method") === "Tarjeta";
  return (
    <Modal open={open} title="Registrar pago" onClose={onClose}>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onClose)}>
        <FormSelect label="Método de pago" registration={register("method")} error={errors.method} options={[{ label: "Efectivo", value: "Efectivo" }, { label: "Transferencia", value: "Transferencia" }, { label: "Tarjeta", value: "Tarjeta" }]} />
        <FormInput label="Valor pagado" type="number" registration={register("amount")} error={errors.amount} />
        {isCard ? (
          <>
            <FormInput label="Últimos 4 dígitos" registration={register("lastFourDigits")} error={errors.lastFourDigits} />
            <FormInput label="Titular" registration={register("holder")} error={errors.holder} />
            <FormInput label="Franquicia" registration={register("franchise")} error={errors.franchise} />
          </>
        ) : null}
        <div className="flex justify-end gap-2 md:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Guardar pago</Button>
        </div>
      </form>
    </Modal>
  );
}
