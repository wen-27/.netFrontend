import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { GlobalApiErrorBanner, useGlobalApiError } from "../shared/components/feedback/GlobalApiErrorBanner";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => useGlobalApiError.getState().show(error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => useGlobalApiError.getState().show(error),
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GlobalApiErrorBanner />
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
}
