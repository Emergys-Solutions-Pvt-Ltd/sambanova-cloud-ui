"use client";

import { useEffect, useId, useState } from "react";

import { SearchField } from "@/components/ui/search-field";
import { Select } from "@/components/ui/select";
import { type ApiKeyStatusFilter } from "@/types/domain";

const SEARCH_DEBOUNCE_MS = 300;

const statusGroups = [
  {
    options: [
      { value: "all", label: "All" },
      { value: "active", label: "Active" },
      { value: "disabled", label: "Disabled" },
    ],
  },
];

interface ApiKeysToolbarProps {
  /** The committed search text (from the URL). */
  search: string;
  status: ApiKeyStatusFilter;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: ApiKeyStatusFilter) => void;
}

/** Search box and Status filter above the table (Figma: API Keys). */
export function ApiKeysToolbar({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: ApiKeysToolbarProps) {
  const statusId = useId();
  const [text, setText] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);

  // Follow the URL when it changes from outside (back button, cleared filters), but never
  // overwrite what is being typed (a trailing space is not part of the committed search).
  if (search !== syncedSearch) {
    setSyncedSearch(search);
    if (search !== text.trim()) setText(search);
  }

  // Commit the typed text a moment after the user stops typing.
  useEffect(() => {
    const committed = text.trim();
    if (committed === search) return;
    const timer = window.setTimeout(() => onSearchChange(committed), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [text, search, onSearchChange]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <SearchField
        aria-label="Search API keys by name or ID"
        placeholder="Search by key name or ID"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <div className="flex items-center gap-2">
        <label htmlFor={statusId} className="text-body text-secondary">
          Status
        </label>
        <div className="w-50">
          <Select
            id={statusId}
            variant="toolbar"
            aria-label="Status"
            groups={statusGroups}
            value={status}
            onValueChange={(next) => onStatusChange(next as ApiKeyStatusFilter)}
          />
        </div>
      </div>
    </div>
  );
}
