import { cn } from "../../utils/cn";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "blue" | "green" | "amber" | "red" | "indigo" | "slate";
};

const tones = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function Badge({ children, tone = "slate" }: BadgeProps) {
  return (
    <span className={cn("inline-flex min-h-7 items-center rounded-md px-2.5 py-1 text-xs font-bold leading-none ring-1", tones[tone])}>
      {children}
    </span>
  );
}
