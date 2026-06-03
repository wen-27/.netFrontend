import { useState } from "react";
import { Activity, CheckCircle2, ShieldAlert } from "lucide-react";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { Button } from "../../../shared/components/ui/Button";
import { partsService } from "../../parts/services/partsService";

type RateLimitAttempt = {
  attempt: number;
  status: number;
};

export function RateLimitTestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [attempts, setAttempts] = useState<RateLimitAttempt[]>([]);
  const [error, setError] = useState<string | null>(null);

  const blockedCount = attempts.filter((item) => item.status === 429).length;
  const successCount = attempts.filter((item) => item.status >= 200 && item.status < 300).length;

  async function runTest() {
    setIsRunning(true);
    setAttempts([]);
    setError(null);

    try {
      const result = await partsService.testRateLimit();
      setAttempts(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible probar el rate limit.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Prueba de rate limit"
        description="Validación manual del límite de solicitudes aplicado al endpoint de repuestos."
        actions={
          <Button icon={<Activity className="h-4 w-4" />} isLoading={isRunning} onClick={runTest}>
            Ejecutar prueba
          </Button>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-slate-950">Endpoint probado</h2>
              <p className="mt-1 break-words text-sm font-medium text-slate-600">GET /api/parts?pageNumber=1&pageSize=1</p>
              <p className="mt-2 text-sm text-slate-500">
                La prueba envía 6 solicitudes seguidas. Con el límite actual de 5 por minuto, una solicitud debería responder 429.
              </p>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          {attempts.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-black">Intento</th>
                    <th className="px-4 py-3 font-black">Estado HTTP</th>
                    <th className="px-4 py-3 font-black">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attempts.map((item) => (
                    <tr key={item.attempt}>
                      <td className="px-4 py-3 font-semibold text-slate-700">#{item.attempt}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{item.status}</td>
                      <td className="px-4 py-3">
                        <span className={item.status === 429 ? "font-black text-amber-700" : "font-semibold text-emerald-700"}>
                          {item.status === 429 ? "Bloqueada por rate limit" : "Permitida"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        <aside className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-950">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-black">Resumen</h2>
          </div>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="rounded-md bg-slate-50 p-3">
              <dt className="font-semibold text-slate-500">Solicitudes enviadas</dt>
              <dd className="mt-1 text-2xl font-black text-slate-950">{attempts.length}</dd>
            </div>
            <div className="rounded-md bg-emerald-50 p-3">
              <dt className="font-semibold text-emerald-700">Permitidas</dt>
              <dd className="mt-1 text-2xl font-black text-emerald-800">{successCount}</dd>
            </div>
            <div className="rounded-md bg-amber-50 p-3">
              <dt className="font-semibold text-amber-700">Bloqueadas</dt>
              <dd className="mt-1 text-2xl font-black text-amber-800">{blockedCount}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </>
  );
}
