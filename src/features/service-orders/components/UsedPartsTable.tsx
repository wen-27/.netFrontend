import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Badge } from "../../../shared/components/ui/Badge";
import { formatCurrency } from "../../../shared/utils/formatters";
import { AddUsedPartModal } from "./AddUsedPartModal";

export function UsedPartsTable() {
  const [open, setOpen] = useState(false);
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Repuestos usados</h3>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>Agregar</Button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Servicio</th><th>Repuesto</th><th>Cantidad</th><th>Precio aplicado</th><th>Aprobado</th><th>Subtotal</th></tr></thead>
          <tbody><tr className="border-t border-slate-100"><td className="p-3">Mantenimiento</td><td>Filtro de aceite</td><td>1</td><td>{formatCurrency(45000)}</td><td><Badge tone="green">Sí</Badge></td><td>{formatCurrency(45000)}</td></tr></tbody>
        </table>
      </div>
      <AddUsedPartModal open={open} onClose={() => setOpen(false)} />
    </Card>
  );
}
