import { type ApiKey, type ExampleItem, type Project } from "@/types/domain";

export const projectsFixture: Project[] = [
  {
    id: "prj_default",
    name: "Default project",
    isDefault: true,
    createdAt: "2026-06-02T09:15:00Z",
  },
  {
    id: "prj_chatbot",
    name: "Support Chatbot",
    isDefault: false,
    createdAt: "2026-07-11T14:02:00Z",
  },
  { id: "prj_rag", name: "RAG Pipeline", isDefault: false, createdAt: "2026-08-20T08:40:00Z" },
  { id: "prj_eval", name: "Model Evaluation", isDefault: false, createdAt: "2026-09-05T17:25:00Z" },
];

/** Mutable per-project store so the create mutation is visible in later list queries. */
export const exampleItemsByProject = new Map<string, ExampleItem[]>(
  projectsFixture.map((project) => [
    project.id,
    Array.from({ length: 23 }, (_, index) => ({
      id: `${project.id}_item_${index + 1}`,
      projectId: project.id,
      name: `${project.name} item ${index + 1}`,
      createdAt: new Date(Date.UTC(2026, 8, 30 - index)).toISOString(),
    })),
  ]),
);

/** No keys yet, on purpose: the API Keys screen starts in its zero state. The create flow will add keys. */
export const apiKeysFixture: ApiKey[] = [];
