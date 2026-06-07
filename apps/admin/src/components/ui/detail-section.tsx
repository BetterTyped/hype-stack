import type * as React from "react";

import { Card } from "@/components/ui/card";

/**
 * A titled block: heading and count sit above the card, the card holds a table
 * or other content with no inner padding so rows reach the edges.
 */
export function DetailSection({
  title,
  count,
  action,
  children,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {typeof count === "number" ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
              {count}
            </span>
          ) : null}
        </div>
        {action}
      </div>
      <Card className="gap-0 overflow-hidden py-0 shadow-sm transition-shadow hover:shadow-md">
        {children}
      </Card>
    </section>
  );
}
