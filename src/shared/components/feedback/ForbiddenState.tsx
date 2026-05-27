import { ShieldAlert } from "lucide-react";
import { Button } from "../ui/Button";

export function ForbiddenState() {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center gap-3 p-8 text-center">
      <ShieldAlert className="h-10 w-10 text-amber-500" />
      <h1 className="text-xl font-bold text-slate-900">Acceso restringido</h1>
      <p className="max-w-md text-sm text-slate-500">Tu rol no tiene permisos para entrar a esta sección.</p>
      <Button variant="secondary" onClick={() => history.back()}>Volver</Button>
    </div>
  );
}
