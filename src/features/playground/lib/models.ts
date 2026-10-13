import { type SelectGroup } from "@/components/ui/select";
import { type CatalogModel, type CompareSlot, type ModelCategory } from "@/types/domain";

/** Group labels of the model menus (Figma: model selector `1398:119665`), from the catalog `category`. */
export const CATEGORY_LABELS: Record<ModelCategory, string> = {
  reasoning: "Reasoning",
  text: "Text",
  "image-text": "Image / text",
};

const CATEGORY_ORDER: ModelCategory[] = ["reasoning", "text", "image-text"];

/** The six Figma rows in Figma order; other catalog models follow inside their group. */
export const PLAYGROUND_MODEL_ORDER = [
  "deepseek-v3.1",
  "deepseek-v3.2",
  "gpt-oss-120b",
  "llama-3.3-70b",
  "minimax-m2.7",
  "gemma-4-31b",
] as const;

/** Default compare pair (Figma: Compare Models `1398:119699`). */
export const DEFAULT_COMPARE: Record<CompareSlot, string> = {
  a: "deepseek-v3.1",
  b: "minimax-m2.7",
};

/** View Code model while no model is selected (Figma: View Code `1398:119330`). */
export const DEFAULT_VIEW_CODE_MODEL = "deepseek-v3.1";

const orderOf = (id: string) => {
  const index = (PLAYGROUND_MODEL_ORDER as readonly string[]).indexOf(id);
  return index === -1 ? Number.POSITIVE_INFINITY : index;
};

/** Catalog models in Playground menu order (grouped by category, Figma rows first). */
export function sortPlaygroundModels(models: readonly CatalogModel[]) {
  return CATEGORY_ORDER.flatMap((category) =>
    models
      .map((model, index) => ({ model, index }))
      .filter(({ model }) => model.category === category)
      .sort((x, y) => orderOf(x.model.id) - orderOf(y.model.id) || x.index - y.index)
      .map(({ model }) => model),
  );
}

/** Menu groups: value = id, label = apiId, Reasoning → Text → Image / text. */
export function groupModelsByCategory(models: readonly CatalogModel[]): SelectGroup[] {
  const sorted = sortPlaygroundModels(models);
  return CATEGORY_ORDER.map((category) => ({
    label: CATEGORY_LABELS[category],
    options: sorted
      .filter((model) => model.category === category)
      .map((model) => ({ value: model.id, label: model.apiId })),
  })).filter((group) => group.options.length > 0);
}
