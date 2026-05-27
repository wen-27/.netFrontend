import { useState } from "react";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { Card } from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { Tabs } from "../../../shared/components/ui/Tabs";
import { FormDatePicker } from "../../../shared/components/forms/FormDatePicker";
import { FormInput } from "../../../shared/components/forms/FormInput";
import { FormSelect } from "../../../shared/components/forms/FormSelect";
import { FormTextarea } from "../../../shared/components/forms/FormTextarea";
import { EntryChecklist } from "../components/EntryChecklist";

const steps = ["Cliente y vehículo", "Datos de ingreso", "Checklist de ingreso", "Servicios y asignación"];

export function ServiceOrderCreatePage() {
  const [step, setStep] = useState(steps[0]);
  return (
    <>
      <PageHeader title="Crear orden de servicio" description="Flujo guiado de ingreso del vehículo, checklist, servicios solicitados y asignación." />
      <Card className="p-5">
        <Tabs tabs={steps.map((item) => ({ label: item, value: item }))} activeTab={step} onChange={setStep} />
        <div className="mt-5">
          {step === "Cliente y vehículo" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput label="Buscar cliente" placeholder="Documento, nombre o email" />
              <FormSelect label="Seleccionar vehículo" options={[{ label: "Toyota Hilux 2022", value: "1" }]} />
              <Button variant="secondary">Crear cliente rápido</Button>
              <Button variant="secondary">Crear vehículo rápido</Button>
            </div>
          ) : null}
          {step === "Datos de ingreso" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FormDatePicker label="Fecha de ingreso" />
              <FormInput label="Kilometraje" type="number" />
              <FormTextarea label="Descripción del problema" />
              <FormTextarea label="Observaciones" />
              <FormDatePicker label="Fecha estimada de entrega" />
            </div>
          ) : null}
          {step === "Checklist de ingreso" ? <EntryChecklist /> : null}
          {step === "Servicios y asignación" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FormTextarea label="Servicios solicitados" />
              <FormSelect label="Asignar mecánico" options={[{ label: "Carlos Rojas", value: "1" }, { label: "Ana Torres", value: "2" }]} />
              <div className="md:col-span-2"><Button>Confirmar creación</Button></div>
            </div>
          ) : null}
        </div>
      </Card>
    </>
  );
}
