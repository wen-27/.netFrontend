import { ReactNode } from "react";
import { Car, ShieldCheck, Wrench } from "lucide-react";
import { cn } from "../../../shared/utils/cn";

type AuthShellProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
};

export function AuthShell({ title, eyebrow = "Bahía Digital", description, children, wide }: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-950">
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="absolute left-0 top-0 h-1.5 w-full atm-shop-stripe" />
      <div className="absolute bottom-0 left-0 h-20 w-full border-t border-slate-800 bg-[repeating-linear-gradient(90deg,rgba(30,41,59,0.45)_0,rgba(30,41,59,0.45)_1px,transparent_1px,transparent_24px)]" />

      <div className="relative grid min-h-screen lg:grid-cols-[minmax(360px,0.9fr)_minmax(520px,1.1fr)]">
        <section className="hidden border-r border-white/10 px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-950 shadow-lg shadow-blue-950/20">
                <Wrench className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xl font-black leading-5">Bahía Digital</p>
                <p className="text-xs font-black uppercase tracking-wide text-blue-300">Taller inteligente</p>
              </div>
            </div>

            <WorkshopCarScene />
          </div>
          <div className="rounded-md border border-white/10 bg-slate-900/80 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Bahía digital</p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-300">
              Clientes, vehículos, órdenes, repuestos y pagos conectados en un solo flujo operativo.
            </p>
          </div>
        </section>

        <section className="flex min-h-screen items-start justify-center px-4 pb-8 pt-20 sm:px-6 lg:px-10 lg:pt-32">
          <div className={cn("w-full", wide ? "max-w-3xl" : "max-w-md")}>
            <div className="mb-5 flex items-center gap-3 lg:hidden">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-950 shadow-lg">
                <Wrench className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-black leading-5 text-white">Bahía Digital</p>
                <p className="text-xs font-black uppercase tracking-wide text-blue-300">Taller inteligente</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-slate-700 bg-white shadow-2xl shadow-slate-950/40">
              <div className="atm-shop-stripe h-1.5" />
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-blue-600">{eyebrow}</p>
                    <h1 className="mt-2 text-2xl font-black leading-tight text-slate-950">{title}</h1>
                    {description ? <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{description}</p> : null}
                  </div>
                  <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white sm:flex">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                </div>
              </div>
              <div className="p-6">{children}</div>
            </div>

            <div className="mt-4 hidden items-center justify-center gap-2 text-xs font-bold text-slate-400 sm:flex">
              <Car className="h-4 w-4 text-amber-300" />
              Plataforma operativa para taller automotriz
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function WorkshopCarScene() {
  return (
    <div className="mt-16" aria-hidden="true">
      <div className="relative overflow-hidden rounded-md border border-slate-700 bg-slate-900/80 p-5 shadow-2xl shadow-slate-950/35">
        <div className="absolute inset-x-0 top-0 h-1 atm-shop-stripe" />
        <div className="absolute left-6 top-7 h-16 w-1 rounded-full bg-amber-300/70 shadow-[0_0_24px_rgba(252,211,77,0.35)]" />
        <div className="absolute right-10 top-7 h-16 w-1 rounded-full bg-blue-300/60 shadow-[0_0_24px_rgba(147,197,253,0.35)]" />
        <div className="absolute left-0 right-0 top-24 border-t border-dashed border-slate-700" />

        <div className="relative h-[330px]">
          <div className="absolute left-1/2 top-7 h-28 w-40 -translate-x-1/2 rounded-b-[48px] border-x-4 border-b-4 border-slate-700" />
          <div className="absolute left-1/2 top-24 h-20 w-2 -translate-x-1/2 rounded-full bg-slate-700" />

          <div className="absolute bottom-20 left-10 right-10 h-2 rounded-full bg-slate-700" />
          <div className="absolute bottom-12 left-16 right-16 h-8 rounded-t-md border-x border-t border-slate-700 bg-slate-800" />
          <div className="absolute bottom-10 left-8 right-8 h-4 rounded-md bg-slate-800 shadow-inner" />

          <svg className="atm-car-drive absolute bottom-24 left-0 h-36 w-[360px]" viewBox="0 0 360 144" role="img">
            <title>Carro entrando a la bahía del taller</title>
            <g>
              <path d="M78 85h218c12 0 22 10 22 22v13H54v-12c0-16 10-30 24-33Z" fill="#2563eb" />
              <path d="M112 52h112c23 0 42 14 54 38H82c16-23 32-38 50-38Z" fill="#1d4ed8" />
              <path d="M132 61h48v28H101c10-15 20-24 31-28Z" fill="#dbeafe" opacity="0.9" />
              <path d="M190 61h30c16 0 30 9 40 28h-70V61Z" fill="#dbeafe" opacity="0.82" />
              <path d="M55 106h32v11H54v-9c0-1 0-2 1-2Z" fill="#fbbf24" />
              <path d="M294 103h23c3 3 4 7 4 12h-27v-12Z" fill="#fee2e2" />
              <path d="M76 86h221c10 0 18 8 18 18v5H58c2-12 9-20 18-23Z" fill="#3b82f6" opacity="0.55" />
              <circle className="atm-wheel-spin" cx="112" cy="120" r="23" fill="#020617" />
              <circle className="atm-wheel-spin" cx="264" cy="120" r="23" fill="#020617" />
              <circle cx="112" cy="120" r="10" fill="#94a3b8" />
              <circle cx="264" cy="120" r="10" fill="#94a3b8" />
              <path d="M112 98v44M90 120h44M264 98v44M242 120h44" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
              <path d="M72 87c17-21 35-34 57-40" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
            </g>
          </svg>

          <div className="atm-scan-line absolute bottom-24 left-10 right-10 h-px bg-amber-300/80 shadow-[0_0_18px_rgba(252,211,77,0.85)]" />
          <div className="absolute bottom-4 left-1/2 w-[85%] -translate-x-1/2 rounded-md border border-slate-700 bg-slate-950/70 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Ingreso a bahía</span>
              <span className="rounded-md bg-amber-300 px-2.5 py-1 text-xs font-black text-slate-950">Listo</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <span className="h-1.5 rounded-full bg-blue-500" />
              <span className="h-1.5 rounded-full bg-emerald-500" />
              <span className="h-1.5 rounded-full bg-amber-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
