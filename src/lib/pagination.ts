export type PageItem = number | "ellipsis-start" | "ellipsis-end";

/**
 * Page buttons to show: first, last, the current page and its neighbours, with "..." for gaps.
 * 100 pages on page 1 gives 1 2 3 ... 100 (Figma); a single missing page is shown instead of "...".
 */
export function getPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 2) {
    pages.add(2);
    pages.add(3);
  }
  if (current >= total - 1) {
    pages.add(total - 2);
    pages.add(total - 1);
  }

  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const items: PageItem[] = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous === 2) items.push(previous + 1);
    else if (previous !== undefined && page - previous > 2) {
      items.push(index === sorted.length - 1 ? "ellipsis-end" : "ellipsis-start");
    }
    items.push(page);
  });
  return items;
}
