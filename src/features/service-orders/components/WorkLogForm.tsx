import { FormInput } from "../../../shared/components/forms/FormInput";
import { FormSelect } from "../../../shared/components/forms/FormSelect";
import { FormTextarea } from "../../../shared/components/forms/FormTextarea";
import { Button } from "../../../shared/components/ui/Button";

export function WorkLogForm() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormSelect label="Servicio relacionado" options={[{ label: "Diagnóstico", value: "diagnosis" }, { label: "Mantenimiento", value: "maintenance" }]} />
      <FormInput label="Tiempo invertido" placeholder="2h 30m" />
      <div className="md:col-span-2"><FormTextarea label="Trabajo realizado" /></div>
      <FormTextarea label="Observaciones técnicas" />
      <FormSelect label="Estado del servicio" options={[{ label: "Pendiente", value: "pending" }, { label: "En progreso", value: "progress" }, { label: "Completado", value: "done" }]} />
      <div className="md:col-span-2"><Button>Registrar trabajo</Button></div>
    </div>
  );
}
