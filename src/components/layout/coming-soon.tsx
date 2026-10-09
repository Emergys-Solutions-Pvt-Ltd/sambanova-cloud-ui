import { Icon } from "@/components/ui/icon/icon";

/** Body placeholder for screens that haven't been built yet. */
export function ComingSoon({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-default p-8 text-center">
      <Icon name="bolt" size="lg" className="text-muted" />
      <p className="text-body text-secondary">This screen is built in a later work area.</p>
      {children && <p className="max-w-md text-body-sm text-muted">{children}</p>}
    </div>
  );
}
