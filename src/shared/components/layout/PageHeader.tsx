type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-5 overflow-hidden rounded-md border border-slate-300 bg-white shadow-panel">
      <div className="atm-shop-stripe h-1.5" />
      <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">Bahía Digital · Operación de taller</p>
        <h1 className="mt-1 text-2xl font-black text-slate-950 text-pretty">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm font-medium leading-6 text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
