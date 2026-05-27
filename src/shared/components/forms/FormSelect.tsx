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
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select
        className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
      {error ? <span className="mt-1 block text-xs font-medium text-red-600">{error.message}</span> : null}
    </label>
  );
}
