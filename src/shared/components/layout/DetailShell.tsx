import { useState } from "react";
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
        <Card className="p-5">
          <Tabs tabs={tabs.map((tab) => ({ label: tab, value: tab }))} activeTab={activeTab} onChange={setActiveTab} />
          <div className="mt-5 min-h-80">
            <h2 className="text-lg font-bold text-slate-900">{activeTab}</h2>
            <p className="mt-2 text-sm text-slate-500">Información operativa lista para conectarse al detalle del endpoint correspondiente.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">Estado</p>
                <p className="mt-1 font-semibold text-slate-800">Disponible para consulta</p>
              </div>
              <div className="rounded-md border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">Integración</p>
                <p className="mt-1 font-semibold text-slate-800">Backend REST + JWT</p>
              </div>
            </div>
          </div>
        </Card>
        {side ? <aside>{side}</aside> : null}
      </div>
    </>
  );
}
