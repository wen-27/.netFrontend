import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { FormInput } from "../../../shared/components/forms/FormInput";
import { AuthShell } from "../components/AuthShell";

export function ForgotPasswordPage() {
  return (
    <AuthShell title="Recuperar contraseña" description="Prepara el acceso para volver al panel operativo cuando el backend habilite este flujo.">
        <div className="mt-5 space-y-4">
          <FormInput label="Email" type="email" />
          <Button className="w-full">Enviar instrucciones</Button>
          <Link className="block text-center text-sm font-semibold text-blue-700 hover:underline" to="/auth/login">Volver a login</Link>
        </div>
    </AuthShell>
  );
}
