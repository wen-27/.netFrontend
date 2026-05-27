import { useSearchParams } from "react-router-dom";

export function useTableQueryState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("pageNumber") ?? searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const search = searchParams.get("search") ?? "";

  function setPage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.delete("page");
    next.set("pageNumber", String(nextPage));
    next.set("pageSize", String(pageSize));
    setSearchParams(next);
  }

  function setSearch(value: string) {
    const next = new URLSearchParams(searchParams);
    next.set("search", value);
    next.delete("page");
    next.set("pageNumber", "1");
    next.set("pageSize", String(pageSize));
    setSearchParams(next);
  }

  return { page, pageSize, search, params: { pageNumber: page, pageSize, search }, setPage, setSearch };
}
