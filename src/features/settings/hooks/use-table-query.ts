"use client";

import { useEffect, useState } from "react";

import { type SettingsListParams } from "@/types/domain";

/** Rows per page of the Members and Invitations tables (Figma shows 7 rows; no page size given). */
export const SETTINGS_PAGE_SIZE = 10;
const SEARCH_DELAY_MS = 250;

/**
 * Search box + page state of a settings table. The query string sent to the API settles 250ms after
 * typing stops, and a new search starts again from page 1.
 */
export function useTableQuery() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const params: SettingsListParams = { page, pageSize: SETTINGS_PAGE_SIZE, search: debounced };
  return { search, setSearch, page, setPage, params };
}
