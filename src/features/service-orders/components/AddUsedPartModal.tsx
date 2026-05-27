import { FormInput } from "../../../shared/components/forms/FormInput";
import { FormSelect } from "../../../shared/components/forms/FormSelect";
import { FormTextarea } from "../../../shared/components/forms/FormTextarea";
import { Button } from "../../../shared/components/ui/Button";
import { Modal } from "../../../shared/components/ui/Modal";

export function AddUsedPartModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} title="Agregar repuesto usado" onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormSelect label="Servicio de la orden" options={[{ label: "Mantenimiento", value: "maintenance" }]} />
        <FormSelect label="Repuesto" options={[{ label: "Pastillas de freno delanteras", value: "brake" }]} />
        <FormInput label="Stock disponible" value="2 unidades" readOnly />
        <FormInput label="Cantidad" type="number" />
        <FormInput label="Precio aplicado" type="number" />
        <FormSelect label="Aprobación del cliente" options={[{ label: "Aprobado", value: "yes" }, { label: "Pendiente", value: "pending" }]} />
        <div className="rounded-md bg-amber-50 p-3 text-sm font-semibold text-amber-700 md:col-span-2">Stock insuficiente. Disponible: 2 unidades. Reduce la cantidad o solicita compra/reposición.</div>
        <div className="md:col-span-2"><FormTextarea label="Observaciones" /></div>
        <div className="flex justify-end gap-2 md:col-span-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={onClose}>Agregar</Button>
        </div>
      </div>
    </Modal>
  );
}
