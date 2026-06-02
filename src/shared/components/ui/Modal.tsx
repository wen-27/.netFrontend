import { X } from "lucide-react";
import { Button } from "./Button";

type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="my-4 flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col rounded-lg border border-slate-200 bg-white shadow-soft">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h2 className="text-base font-black text-slate-900">{title}</h2>
          <Button variant="ghost" className="h-9 w-9 px-0" onClick={onClose} icon={<X className="h-4 w-4" />} aria-label="Cerrar" />
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
