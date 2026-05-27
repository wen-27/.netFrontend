import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { FormInput } from "../../../shared/components/forms/FormInput";

export function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-slate-950">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-slate-500">Este flujo queda preparado visualmente hasta que el backend publique el endpoint.</p>
        <div className="mt-5 space-y-4">
          <FormInput label="Email" type="email" />
          <Button className="w-full">Enviar instrucciones</Button>
          <Link className="block text-center text-sm font-semibold text-blue-700 hover:underline" to="/auth/login">Volver a login</Link>
        </div>
      </Card>
    </main>
  );
}
