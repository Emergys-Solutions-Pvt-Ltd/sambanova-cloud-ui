"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/** Rows per page of the price table (Figma: "Showing 1-8 of 8", so one page for today's models). */
export const PRICING_PAGE_SIZE = 10;

const parsePage = (value: string | null) => {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
};

/** The table page lives in the URL as `?page=`, so it survives a reload and the back button. */
export function usePricingTableState() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const params = { page: parsePage(searchParams.get("page")), pageSize: PRICING_PAGE_SIZE };

  const setPage = useCallback(
    (value: number) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value > 1) next.set("page", String(value));
      else next.delete("page");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { params, setPage };
}
