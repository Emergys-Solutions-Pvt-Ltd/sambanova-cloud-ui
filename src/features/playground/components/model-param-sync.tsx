"use client";

import { useSearchParams } from "next/navigation";

import { useModelParam } from "../hooks/use-model-param";

/**
 * Reads `?model=` and hands it to `useModelParam`. Rendered inside `<Suspense>` by
 * PlaygroundView, since `useSearchParams` suspends during prerendering under Cache Components.
 */
export function ModelParamSync() {
  const searchParams = useSearchParams();
  useModelParam(searchParams.get("model"));
  return null;
}
