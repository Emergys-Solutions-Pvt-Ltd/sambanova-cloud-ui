"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { type ApiKeyListParams, type ApiKeyStatusFilter } from "@/types/domain";

export const API_KEYS_PAGE_SIZE = 10;

const parseStatus = (value: string | null): ApiKeyStatusFilter =>
  value === "active" || value === "disabled" ? value : "all";

const parsePage = (value: string | null) => {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
};

type TableStatePatch = Partial<Pick<ApiKeyListParams, "page" | "search" | "status">>;

/**
 * The API Keys table state (search text, status filter, page) lives in the URL as
 * `?q=&status=&page=`, so it survives a reload and the back button. Defaults are left out of the
 * URL, and changing the search or the filter returns to page 1.
 */
export function useApiKeysTableState() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const params: ApiKeyListParams = {
    page: parsePage(searchParams.get("page")),
    pageSize: API_KEYS_PAGE_SIZE,
    search: searchParams.get("q") ?? "",
    status: parseStatus(searchParams.get("status")),
  };

  const update = useCallback(
    (patch: TableStatePatch) => {
      const next = new URLSearchParams(searchParams.toString());
      const resetsPage = "search" in patch || "status" in patch;

      if ("search" in patch) {
        if (patch.search) next.set("q", patch.search);
        else next.delete("q");
      }
      if ("status" in patch) {
        if (patch.status && patch.status !== "all") next.set("status", patch.status);
        else next.delete("status");
      }
      const page = resetsPage ? 1 : (patch.page ?? 1);
      if (page > 1) next.set("page", String(page));
      else next.delete("page");

      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return {
    params,
    setPage: (page: number) => update({ page }),
    setSearch: (search: string) => update({ search }),
    setStatus: (status: ApiKeyStatusFilter) => update({ status }),
  };
}
