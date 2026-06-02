import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { AuthShell } from "../components/AuthShell";

export function SessionExpiredPage() {
  return (
    <AuthShell title="Sesión expirada" description="Tu sesión venció o fue invalidada. Inicia sesión nuevamente para continuar.">
      <Button className="w-full">
        <Link to="/auth/login">Volver a login</Link>
      </Button>
    </AuthShell>
  );
}
