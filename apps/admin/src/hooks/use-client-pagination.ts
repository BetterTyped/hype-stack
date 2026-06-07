import { useMemo, useState } from "react";

/** Slices an in-memory array into pages and exposes the controls a Pagination footer needs. */
export function useClientPagination<T>(items: T[], pageSize = 5) {
  const [page, setPage] = useState(0);

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount - 1);

  const pageItems = useMemo(
    () => items.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [items, safePage, pageSize],
  );

  const from = total === 0 ? 0 : safePage * pageSize + 1;
  const to = Math.min(total, safePage * pageSize + pageSize);

  return {
    page: safePage,
    pageItems,
    total,
    pageCount,
    hasPagination: total > pageSize,
    label: `${from}-${to} of ${total}`,
    canPrev: safePage > 0,
    canNext: safePage < pageCount - 1,
    prev: () => setPage((p) => Math.max(0, p - 1)),
    next: () => setPage((p) => p + 1),
  };
}
