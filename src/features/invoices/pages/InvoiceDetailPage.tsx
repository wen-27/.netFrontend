import { CreditCard } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../shared/components/ui/Button";
import { DetailShell } from "../../../shared/components/layout/DetailShell";
import { RegisterPaymentModal } from "../components/RegisterPaymentModal";

export function InvoiceDetailPage() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <DetailShell title="Detalle de factura" description="Cliente, documento, orden, mano de obra, repuestos, impuestos, total y pagos asociados." tabs={["Resumen", "Mano de obra", "Repuestos", "Pagos asociados"]} actions={<Button icon={<CreditCard className="h-4 w-4" />} onClick={() => setOpen(true)}>Registrar pago</Button>} />
      <RegisterPaymentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
