import { FieldError, UseFormRegisterReturn } from "react-hook-form";

type FormDatePickerProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: FieldError;
  registration?: UseFormRegisterReturn;
};

export function FormDatePicker({ label, error, registration, ...props }: FormDatePickerProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="date"
        className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        {...registration}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs font-medium text-red-600">{error.message}</span> : null}
    </label>
  );
}
