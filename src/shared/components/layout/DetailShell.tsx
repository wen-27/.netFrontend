import { useState } from "react";
import { ClipboardList, Gauge } from "lucide-react";
import { Tabs } from "../ui/Tabs";
import { Card } from "../ui/Card";
import { PageHeader } from "./PageHeader";

type DetailShellProps = {
  title: string;
  description: string;
  tabs: string[];
  side?: React.ReactNode;
  actions?: React.ReactNode;
};

export function DetailShell({ title, description, tabs, side, actions }: DetailShellProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <>
      <PageHeader title={title} description={description} actions={actions} />
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <div className="atm-shop-stripe h-1" />
          <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                <ClipboardList className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-black text-slate-950">Ficha operativa</h2>
                <p className="text-sm font-medium text-slate-500">Resumen, seguimiento y datos asociados.</p>
              </div>
            </div>
          </div>
          <div className="p-5">
          <Tabs tabs={tabs.map((tab) => ({ label: tab, value: tab }))} activeTab={activeTab} onChange={setActiveTab} />
          <div className="mt-5 min-h-80">
            <h3 className="text-lg font-black text-slate-900">{activeTab}</h3>
            <p className="mt-2 text-sm font-medium text-slate-500">Consulta la información principal y el seguimiento asociado al registro.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-slate-50/50 p-4">
                <p className="text-xs font-black uppercase text-slate-400">Estado</p>
                <p className="mt-1 font-bold text-slate-800">Disponible para consulta</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50/50 p-4">
                <p className="text-xs font-black uppercase text-slate-400">Seguimiento</p>
                <p className="mt-1 flex items-center gap-2 font-bold text-slate-800">
                  <Gauge className="h-4 w-4 text-blue-600" />
                  Registro operativo
                </p>
              </div>
            </div>
          </div>
          </div>
        </Card>
        {side ? <aside className="[&>div]:rounded-md">{side}</aside> : null}
      </div>
    </>
  );
}
