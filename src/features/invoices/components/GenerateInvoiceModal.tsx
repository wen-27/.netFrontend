import { Button } from "../../../shared/components/ui/Button";
import { Modal } from "../../../shared/components/ui/Modal";
import { formatCurrency } from "../../../shared/utils/formatters";

export function GenerateInvoiceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} title="Generar factura" onClose={onClose}>
      <div className="space-y-3 text-sm">
        <p><strong>Orden:</strong> OT-2026-0020</p>
        <p><strong>Cliente:</strong> Carlos Rojas</p>
        <p><strong>Servicios:</strong> Diagnóstico, mantenimiento preventivo</p>
        <p><strong>Repuestos:</strong> Filtro de aceite premium</p>
        <div className="rounded-md bg-slate-50 p-3">
          <p>Subtotal: {formatCurrency(620000)}</p>
          <p>Impuestos: {formatCurrency(117800)}</p>
          <p className="font-bold">Total: {formatCurrency(737800)}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={onClose}>Generar</Button>
        </div>
      </div>
    </Modal>
  );
}
