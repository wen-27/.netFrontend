import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { SelectOption } from "../../types/common";

type FormSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  error?: FieldError;
  registration?: UseFormRegisterReturn;
};

export function FormSelect({ label, options, error, registration, ...props }: FormSelectProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <select
        className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        {...registration}
        {...props}
      >
        <option value="">Seleccionar</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="mt-1 block text-xs font-bold text-red-600">{error.message}</span> : null}
    </label>
  );
}
