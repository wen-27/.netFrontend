import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  isLoading?: boolean;
  icon?: ReactNode;
};

const variants = {
  primary: "bg-blue-600 text-white shadow-sm shadow-blue-900/10 hover:bg-blue-700 focus:ring-blue-200",
  secondary: "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-200",
  danger: "bg-red-600 text-white shadow-sm shadow-red-900/10 hover:bg-red-700 focus:ring-red-200",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus:ring-slate-200",
  success: "bg-emerald-600 text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-700 focus:ring-emerald-200",
};

export function Button({
  className,
  variant = "primary",
  isLoading,
  icon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
