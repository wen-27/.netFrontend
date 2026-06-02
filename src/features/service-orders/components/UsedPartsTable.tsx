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
      <div className="mt-4">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="w-[18%] break-words p-3">Servicio</th>
              <th className="w-[22%] break-words p-3">Repuesto</th>
              <th className="w-[12%] break-words p-3">Cantidad</th>
              <th className="w-[18%] break-words p-3">Precio aplicado</th>
              <th className="w-[14%] break-words p-3">Aprobado</th>
              <th className="w-[16%] break-words p-3">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="break-words p-3">Mantenimiento</td>
              <td className="break-words p-3">Filtro de aceite</td>
              <td className="break-words p-3">1</td>
              <td className="break-words p-3">{formatCurrency(45000)}</td>
              <td className="break-words p-3"><Badge tone="green">Sí</Badge></td>
              <td className="break-words p-3">{formatCurrency(45000)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <AddUsedPartModal open={open} onClose={() => setOpen(false)} />
    </Card>
  );
}
