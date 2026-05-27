import { X } from "lucide-react";
import { Button } from "./Button";

type DrawerProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export function Drawer({ open, title, children, onClose }: DrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40">
      <aside className="ml-auto h-full w-full max-w-xl overflow-y-auto bg-white shadow-soft">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <Button variant="ghost" className="h-9 w-9 px-0" onClick={onClose} icon={<X className="h-4 w-4" />} aria-label="Cerrar" />
        </div>
        <div className="p-5">{children}</div>
      </aside>
    </div>
  );
}
