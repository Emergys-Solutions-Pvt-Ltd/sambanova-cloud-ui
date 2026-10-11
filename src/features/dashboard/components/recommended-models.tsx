"use client";

import { useState } from "react";

import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthGate } from "@/features/auth";

import { useRecommendedModels } from "../hooks/use-dashboard-data";

import { CompareModelsDialog } from "./compare-models-dialog";
import { ModelCard } from "./model-card";

export function RecommendedModels() {
  const { data, error, refetch } = useRecommendedModels();
  const [compareOpen, setCompareOpen] = useState(false);
  const { guardAction } = useAuthGate();

  return (
    <section aria-labelledby="recommended-title" className="flex flex-col gap-4">
      <SectionHeader
        id="recommended-title"
        title="Recommended Models"
        description="Experience the best open-source models. Learn more about each of them in our documentation."
        action={
          <Button
            variant="outline"
            onClick={guardAction(() => setCompareOpen(true))}
            aria-haspopup="dialog"
          >
            Compare Models
          </Button>
        }
      />

      {error ? (
        <ErrorState message="Couldn’t load recommended models." onRetry={() => void refetch()} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data
            ? data.map((model) => (
                <li key={model.modelId}>
                  <ModelCard model={model} />
                </li>
              ))
            : [0, 1, 2, 3].map((key) => (
                <li key={key}>
                  <Skeleton className="h-94 rounded-xl" />
                </li>
              ))}
        </ul>
      )}

      <CompareModelsDialog open={compareOpen} onOpenChange={setCompareOpen} />
    </section>
  );
}
