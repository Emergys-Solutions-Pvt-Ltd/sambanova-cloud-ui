import { http, HttpResponse } from "msw";

import { type PaginatedResponse } from "@/lib/api/types";
import { type ModelPriceRow } from "@/types/domain";

import { pageOf } from "../db/api-key-usage";
import { modelPricingFixture } from "../fixtures/model-pricing";
import { api, withScenario } from "./shared";

/** What the Pricing page reads. Public like the model catalog: guests can browse prices. */
export const pricingHandlers = [
  http.get(
    api("/models/pricing"),
    withScenario(({ request }) => {
      const url = new URL(request.url);
      const page = pageOf(
        modelPricingFixture,
        Number(url.searchParams.get("page")) || 1,
        Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 10)),
      );
      return HttpResponse.json(page satisfies PaginatedResponse<ModelPriceRow>);
    }),
  ),
];
