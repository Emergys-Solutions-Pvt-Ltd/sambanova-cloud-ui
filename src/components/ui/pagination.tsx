import { cn } from "@/lib/cn";
import { getPageItems } from "@/lib/pagination";

import { Icon } from "./icon/icon";

interface PaginationProps {
  /** Current page, 1-based. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Accessible name of the nav, e.g. "Members pages". */
  label?: string;
  className?: string;
}

/**
 * Shared by every item. The fill lives in `idleFill` / the active classes, never in both: `cn()` only
 * joins class names, and two background classes on one button leave the winner to CSS order (the
 * active page lost its purple fill that way). Padding is 12 / 5 so that, with the 1px frame, the bar is
 * 33px high like Figma's Pagination frame.
 */
const itemClasses =
  "flex items-center justify-center px-3 py-1.25 text-body font-medium " +
  "transition-colors duration-(--sn-duration-fast) ease-standard";
const idleFill = "bg-pagination-item";

/** Previous / page numbers / next (Figma: Pagination). Pages are `aria-current` when active. */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  label = "Pagination",
  className,
}: PaginationProps) {
  const items = getPageItems(page, totalPages);

  return (
    <nav aria-label={label} className={className}>
      <ul className="flex items-stretch overflow-hidden rounded-xs border border-default">
        <li className="flex">
          <button
            type="button"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={cn(
              itemClasses,
              idleFill,
              "text-secondary hover:bg-hover disabled:text-disabled",
            )}
          >
            <Icon name="chevron-left" size="md" />
          </button>
        </li>

        {items.map((item) => (
          <li key={item} className="flex border-l border-default">
            {typeof item === "number" ? (
              <button
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => onPageChange(item)}
                className={cn(
                  itemClasses,
                  item === page
                    ? "bg-pagination-active text-pagination-active"
                    : cn(idleFill, "text-tab-inactive hover:bg-hover hover:text-primary"),
                )}
              >
                {item}
              </button>
            ) : (
              <span aria-hidden="true" className={cn(itemClasses, idleFill, "text-tab-inactive")}>
                ...
              </span>
            )}
          </li>
        ))}

        <li className="flex border-l border-default">
          <button
            type="button"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={cn(
              itemClasses,
              idleFill,
              "text-secondary hover:bg-hover disabled:text-disabled",
            )}
          >
            <Icon name="chevron-right" size="md" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
