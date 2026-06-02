import { LucideIcon } from "lucide-react";
import { Card } from "../ui/Card";
import { cn } from "../../utils/cn";

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  tone: "blue" | "green" | "amber" | "red" | "indigo";
  icon: LucideIcon;
};

const tones = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  red: "bg-red-50 text-red-700 ring-red-100",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
};

export function MetricCard({ label, value, hint, tone, icon: Icon }: MetricCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-slate-900" />
      <div className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 font-mono text-3xl font-black text-slate-950">{value}</p>
          {hint ? <p className="mt-1 text-xs font-medium text-slate-500">{hint}</p> : null}
        </div>
        <span className={cn("rounded-md p-2 ring-1", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      </div>
    </Card>
  );
}
