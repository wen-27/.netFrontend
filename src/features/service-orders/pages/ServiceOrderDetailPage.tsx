import { FileText, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Modal } from "../../../shared/components/ui/Modal";
import { DetailShell } from "../../../shared/components/layout/DetailShell";
import { FormSelect } from "../../../shared/components/forms/FormSelect";
import { FormTextarea } from "../../../shared/components/forms/FormTextarea";
import { PermissionGate } from "../../../guards/PermissionGate";
import { GenerateInvoiceModal } from "../../invoices/components/GenerateInvoiceModal";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { OrderStatusTimeline } from "../components/OrderStatusTimeline";
import { UsedPartsTable } from "../components/UsedPartsTable";
import { WorkLogForm } from "../components/WorkLogForm";

export function ServiceOrderDetailPage() {
  const [statusOpen, setStatusOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const side = (
    <Card className="p-5">
      <h2 className="font-bold text-slate-900">Resumen</h2>
      <div className="mt-4 space-y-3 text-sm">
        <p><strong>Código:</strong> OT-2026-0020</p>
        <p><strong>Cliente:</strong> Carlos Rojas</p>
        <p><strong>Vehículo:</strong> Hyundai Elantra 2021</p>
        <p><strong>Mecánico:</strong> Miguel Peña</p>
        <OrderStatusBadge status="Completada" />
      </div>
    </Card>
  );

  return (
    <>
      <DetailShell
        title="OT-2026-0020"
        description="Orden completada · Carlos Rojas · Hyundai Elantra 2021 · Miguel Peña"
        tabs={["Resumen", "Servicios", "Trabajo realizado", "Repuestos usados", "Checklist ingreso", "Historial estados", "Facturación"]}
        side={side}
        actions={
          <>
            <Button variant="secondary" icon={<RefreshCcw className="h-4 w-4" />} onClick={() => setStatusOpen(true)}>Cambiar estado</Button>
            <PermissionGate allowedRoles={["Admin", "Mechanic"]} fallback={<Button disabled title="Disponible solo para órdenes completadas">Generar factura</Button>}>
              <Button icon={<FileText className="h-4 w-4" />} onClick={() => setInvoiceOpen(true)}>Generar factura</Button>
            </PermissionGate>
          </>
        }
      />
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <WorkLogForm />
        <UsedPartsTable />
        <Card className="p-5"><h3 className="mb-4 font-bold">Historial de estados</h3><OrderStatusTimeline /></Card>
      </div>
      <Modal open={statusOpen} title="Cambiar estado" onClose={() => setStatusOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Estado actual: <strong>Completada</strong></p>
          <FormSelect label="Nuevo estado" options={[{ label: "Nueva", value: "new" }, { label: "En progreso", value: "progress" }, { label: "Cancelada", value: "cancelled" }]} />
          <FormTextarea label="Motivo/comentario" />
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setStatusOpen(false)}>Cancelar</Button><Button onClick={() => setStatusOpen(false)}>Guardar</Button></div>
        </div>
      </Modal>
      <GenerateInvoiceModal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} />
    </>
  );
}
