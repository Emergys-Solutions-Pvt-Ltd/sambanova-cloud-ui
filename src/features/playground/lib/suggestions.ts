import { type IconName } from "@/components/ui/icon/icon";

export interface Suggestion {
  icon: IconName;
  label: string;
}

/** Hero suggestion chips (Figma: Playground hero `1398:118805`). Clicking one fills the composer. */
export const SUGGESTIONS: readonly Suggestion[] = [
  { icon: "target-arrow", label: "Create a product launch strategy" },
  { icon: "switch-horizontal", label: "Compare DeepSeek, Llama & Gemma" },
  { icon: "calendar", label: "Plan a 5-day business trip itinerary" },
];
