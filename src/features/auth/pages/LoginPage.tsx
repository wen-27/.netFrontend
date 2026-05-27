import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { FormInput } from "../../../shared/components/forms/FormInput";
import { useAuth } from "../../../shared/hooks/useAuth";
import { dashboardByRole } from "../../../shared/components/layout/navigation";
import { authService } from "../services/authService";

const schema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type Values = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { token, role, setSession } = useAuth();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  if (token && role) return <Navigate to={dashboardByRole[role]} replace />;

  async function onSubmit(values: Values) {
    setServerError("");
    try {
      const response = await authService.login(values);
      setSession(response.accessToken, response.role, response.email);
      const nextRole = useAuth.getState().role;
      navigate(nextRole ? dashboardByRole[nextRole] : "/dashboard/client", { replace: true });
    } catch {
      setServerError("Credenciales inválidas o servicio no disponible.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6">
          <p className="text-sm font-black text-blue-600">AutoTallerManager</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-slate-500">Accede al panel operativo del taller.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <FormInput label="Email" type="email" registration={register("email")} error={errors.email} />
          <FormInput label="Contraseña" type="password" registration={register("password")} error={errors.password} />
          {serverError ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{serverError}</p> : null}
          <Button className="w-full" type="submit" isLoading={isSubmitting} icon={<LogIn className="h-4 w-4" />}>Iniciar sesión</Button>
        </form>
        <div className="mt-5 flex justify-between text-sm font-semibold">
          <Link className="text-blue-700 hover:underline" to="/auth/register-client">Registro cliente</Link>
          <Link className="text-slate-600 hover:underline" to="/auth/forgot-password">Recuperar contraseña</Link>
        </div>
      </Card>
    </main>
  );
}
