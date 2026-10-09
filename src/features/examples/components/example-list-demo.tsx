"use client";

import { type FormEvent, useState } from "react";

import { useActiveProject, useProjects, useSwitchProject } from "@/features/projects";
import { useCurrentUser } from "@/features/session";

import { useCreateExample, useExamples } from "../hooks/use-examples";

/**
 * Dev-only walkthrough of the data layer: MSW → Axios client → TanStack Query.
 * Unstyled on purpose; it only proves the plumbing works.
 */
export function ExampleListDemo() {
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");

  const user = useCurrentUser();
  const projects = useProjects();
  const { project } = useActiveProject();
  const switchProject = useSwitchProject();
  const examples = useExamples(project?.id, page);
  const createExample = useCreateExample(project?.id);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createExample.mutate(
      { name },
      {
        onSuccess: () => {
          setName("");
          setPage(1);
        },
      },
    );
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <section aria-labelledby="demo-user">
        <h2 id="demo-user" className="font-semibold">
          GET /me
        </h2>
        {user.isPending && <p>Loading…</p>}
        {user.error && (
          <p role="alert">
            {user.error.name}: {user.error.message}
          </p>
        )}
        {user.data && (
          <p>
            {user.data.name} · {user.data.email} · ${user.data.creditBalance.toFixed(2)} credits
          </p>
        )}
      </section>

      <section aria-labelledby="demo-projects">
        <h2 id="demo-projects" className="font-semibold">
          GET /projects
        </h2>
        {projects.error && <p role="alert">{projects.error.message}</p>}
        <label className="flex items-center gap-2">
          Active project
          <select
            className="border px-2 py-1"
            value={project?.id ?? ""}
            onChange={(event) => {
              switchProject(event.target.value);
              setPage(1);
            }}
            disabled={!projects.data}
          >
            {projects.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section aria-labelledby="demo-examples">
        <h2 id="demo-examples" className="font-semibold">
          GET /projects/:id/examples (paginated)
        </h2>
        {examples.error && <p role="alert">{examples.error.message}</p>}
        <ul className={examples.isPlaceholderData ? "opacity-50" : undefined}>
          {examples.data?.data.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
        {examples.data && (
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              className="border px-2 py-1"
              onClick={() => setPage((current) => current - 1)}
              disabled={page <= 1}
            >
              Previous
            </button>
            <span>
              Page {examples.data.page} of {examples.data.totalPages} ({examples.data.total} items)
            </span>
            <button
              type="button"
              className="border px-2 py-1"
              onClick={() => setPage((current) => current + 1)}
              disabled={page >= examples.data.totalPages || examples.isPlaceholderData}
            >
              Next
            </button>
          </div>
        )}
      </section>

      <section aria-labelledby="demo-create">
        <h2 id="demo-create" className="font-semibold">
          POST /projects/:id/examples (invalidates the list)
        </h2>
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <input
            className="border px-2 py-1"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Item name"
            aria-label="Item name"
          />
          <button type="submit" className="border px-2 py-1" disabled={createExample.isPending}>
            {createExample.isPending ? "Creating…" : "Create"}
          </button>
        </form>
        {createExample.error && (
          <p role="alert">
            {createExample.error.code}: {createExample.error.message}
          </p>
        )}
      </section>
    </div>
  );
}
