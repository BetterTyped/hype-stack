import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn, formatNumber } from "@/lib/utils";

/**
 * A single stat in a divided row. Renders a label, a large value, and either a
 * percentage delta or a custom `sub` element below it. An optional `icon` sits
 * at the right edge of the label row to tag the metric (matching color). Used
 * for the strip above the dashboard chart and the traffic map. Inset left
 * dividers (everything past the first cell) are drawn by the cell itself so the
 * row reads as one unit.
 */
export function StatCell({
  label,
  value,
  delta,
  invertDelta = false,
  sub,
  icon,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  delta?: number | null;
  invertDelta?: boolean;
  sub?: ReactNode;
  icon?: ReactNode;
  valueClassName?: string;
}) {
  const rising = (delta ?? 0) >= 0;
  const isPositive = invertDelta ? !rising : rising;

  return (
    <div className="relative flex shrink-0 flex-col gap-1 px-4 py-4 not-first:before:absolute not-first:before:inset-y-4 not-first:before:left-0 not-first:before:w-px not-first:before:bg-border">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {icon ? <span className="shrink-0">{icon}</span> : null}
      </div>
      <span className={cn("truncate text-2xl font-semibold tracking-tight tabular-nums", valueClassName)}>
        {value}
      </span>
      {sub ? (
        sub
      ) : typeof delta === "number" ? (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium",
            isPositive ? "text-emerald-500" : "text-destructive",
          )}
        >
          {Math.abs(delta).toFixed(0)}%
          {rising ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
        </span>
      ) : (
        <span className="text-xs text-transparent">.</span>
      )}
    </div>
  );
}

/** Live presence indicator: a pulsing dot plus the current online count. */
export function LiveVisitors({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      {formatNumber(count)} online now
    </span>
  );
}
