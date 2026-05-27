import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";

export function SessionExpiredPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-md p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-950">Sesión expirada</h1>
        <p className="mt-2 text-sm text-slate-500">Tu sesión venció o fue invalidada. Inicia sesión nuevamente para continuar.</p>
        <Button className="mt-5"><Link to="/auth/login">Volver a login</Link></Button>
      </Card>
    </main>
  );
}
