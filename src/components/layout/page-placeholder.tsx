import { type ReactNode } from "react";

interface PagePlaceholderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

/** Temporary page body until each feature is built. Replaced by <PageHeader /> in Work Area D. */
export function PagePlaceholder({ title, description, children }: PagePlaceholderProps) {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description && <p className="opacity-70">{description}</p>}
      {children}
    </section>
  );
}
