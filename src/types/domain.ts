/**
 * Domain models. Shapes are provisional until the SambaNova API contract is
 * published; keep the mocks in src/mocks/fixtures in sync with these.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  /** Remaining prepaid credit, in USD. */
  creditBalance: number;
}

export interface Project {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
}

/** Placeholder resource used to demonstrate the paginated query + mutation pattern. */
export interface ExampleItem {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
}

export interface CreateExampleItemInput {
  name: string;
}
