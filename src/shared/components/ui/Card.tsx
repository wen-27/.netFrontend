import { cn } from "../../utils/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return <div className={cn("rounded-md border border-slate-300/80 bg-white shadow-panel", className)} {...props} />;
}
