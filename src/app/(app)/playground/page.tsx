import type { Metadata } from "next";

import { PlaygroundView } from "@/features/playground";

export const metadata: Metadata = {
  title: "Playground",
  description: "Test prompts, compare models and tune parameters on SambaNova Cloud.",
};

export default function PlaygroundPage() {
  return <PlaygroundView />;
}
