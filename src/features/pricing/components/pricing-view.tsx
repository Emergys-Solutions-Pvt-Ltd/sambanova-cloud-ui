"use client";

import { PageContent, PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/ui/error-state";

import { useModelPricing } from "../hooks/use-model-pricing";
import { usePricingTableState } from "../hooks/use-pricing-table-state";
import { ModelPricingTable } from "./model-pricing-table";

/** Pricing screen (Figma: Plans & Pricing): what each model costs per million tokens. */
export function PricingView() {
  const { params, setPage } = usePricingTableState();
  const pricing = useModelPricing(params);

  return (
    <>
      <PageHeader
        title="Pricing"
        subtitle="Compare model pricing, and choose the best option for your AI workloads."
      />

      {/* Figma's table card has its 1px stroke outside the box, so it starts 29px under the header. */}
      <PageContent className="pt-7.25">
        {pricing.error && !pricing.data ? (
          <ErrorState
            message="Couldn’t load the model prices."
            onRetry={() => void pricing.refetch()}
          />
        ) : (
          <ModelPricingTable
            result={pricing.data}
            onPageChange={setPage}
            loadingMore={pricing.isPlaceholderData}
          />
        )}
      </PageContent>
    </>
  );
}
