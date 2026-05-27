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
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  indigo: "bg-indigo-50 text-indigo-700",
};

export function MetricCard({ label, value, hint, tone, icon: Icon }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
          {hint ? <p className="mt-1 text-xs font-medium text-slate-500">{hint}</p> : null}
        </div>
        <span className={cn("rounded-md p-2", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}
