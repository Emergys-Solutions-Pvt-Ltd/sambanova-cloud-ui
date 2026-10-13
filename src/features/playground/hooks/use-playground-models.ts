"use client";

import { useMemo } from "react";

import { useModelCatalog } from "@/features/dashboard";
import { type CatalogModel } from "@/types/domain";

import {
  DEFAULT_COMPARE,
  DEFAULT_VIEW_CODE_MODEL,
  groupModelsByCategory,
  sortPlaygroundModels,
} from "../lib/models";

const EMPTY: CatalogModel[] = [];

const DEFAULTS = { compare: DEFAULT_COMPARE, viewCode: DEFAULT_VIEW_CODE_MODEL } as const;

/**
 * Model catalog for the Playground pickers (Figma: model selector `1398:119665`):
 * models in menu order, lookup by id, grouped menu options and the defaults.
 * The catalog endpoint is public, so this works for guests.
 */
export function usePlaygroundModels() {
  const { data, isPending, isError, refetch } = useModelCatalog();
  const catalog = data ?? EMPTY;

  const models = useMemo(() => sortPlaygroundModels(catalog), [catalog]);
  const byId = useMemo(
    () => new Map<string, CatalogModel>(catalog.map((model) => [model.id, model])),
    [catalog],
  );
  const groups = useMemo(() => groupModelsByCategory(catalog), [catalog]);

  /** The catalog model for `id`, or undefined (unknown id, or catalog not loaded yet). */
  const resolve = (id: string | null | undefined) => (id ? byId.get(id) : undefined);

  return {
    models,
    byId: byId as ReadonlyMap<string, CatalogModel>,
    groups,
    resolve,
    defaults: DEFAULTS,
    isPending,
    isError,
    refetch,
  };
}
