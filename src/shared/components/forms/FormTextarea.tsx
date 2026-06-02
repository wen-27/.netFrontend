import { FieldError, UseFormRegisterReturn } from "react-hook-form";

type FormTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: FieldError;
  registration?: UseFormRegisterReturn;
};

export function FormTextarea({ label, error, registration, ...props }: FormTextareaProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <textarea
        className="mt-1 min-h-28 w-full rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        {...registration}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs font-bold text-red-600">{error.message}</span> : null}
    </label>
  );
}
