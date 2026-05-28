import { create } from "zustand";
import { X } from "lucide-react";
import { ApiErrorAlert } from "./ApiErrorAlert";
import { Button } from "../ui/Button";

type ApiErrorState = {
  error: unknown;
  show: (error: unknown) => void;
  clear: () => void;
};

export const useGlobalApiError = create<ApiErrorState>((set) => ({
  error: null,
  show: (error) => set({ error }),
  clear: () => set({ error: null }),
}));

export function GlobalApiErrorBanner() {
  const error = useGlobalApiError((state) => state.error);
  const clear = useGlobalApiError((state) => state.clear);
  if (!error) return null;

  return (
    <div className="fixed left-1/2 top-4 z-50 w-[min(720px,calc(100vw-32px))] -translate-x-1/2">
      <div className="relative">
        <ApiErrorAlert error={error} />
        <Button className="absolute right-3 top-3 h-8 px-2" variant="secondary" onClick={clear}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
