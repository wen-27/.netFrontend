import { Drawer } from "../../../shared/components/ui/Drawer";
import { AuditEvent } from "../../../shared/types/domain";
import { formatDateTime } from "../../../shared/utils/formatters";

export function AuditDetailDrawer({ event, onClose }: { event: AuditEvent | null; onClose: () => void }) {
  return (
    <Drawer open={Boolean(event)} title="Detalle de auditoría" onClose={onClose}>
      {event ? (
        <div className="space-y-4 text-sm">
          <p><strong>Fecha y hora:</strong> {formatDateTime(event.date)}</p>
          <p><strong>Usuario:</strong> {event.user}</p>
          <p><strong>Acción:</strong> {event.action}</p>
          <p><strong>Entidad afectada:</strong> {event.entity}</p>
          <p><strong>ID entidad:</strong> {event.entityId}</p>
          <p><strong>IP/origen:</strong> {event.origin}</p>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="font-bold text-slate-900">Metadatos</p>
            <p className="mt-1 text-slate-500">Valores anterior/nuevo disponibles al conectar el endpoint de detalle.</p>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}
