import { Eye, Users } from "lucide-react";
import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ANALYTICS_COLORS } from "@/lib/analytics-colors";
import { formatCurrency, formatCurrencyPrecise, formatNumber } from "@/lib/utils";

export type DualBarListItem = {
  key: string;
  label: string;
  /** Optional leading glyph (e.g. a browser or OS icon). Flags live in the label. */
  icon?: ReactNode;
  /** Optional hover text for the label (e.g. the raw path). */
  hint?: string;
  visitors: number;
  /** Distinct signed-in users attributed to this entry. */
  users: number;
  /** Page views attributed to this entry. */
  pageViews: number;
  /** Revenue in the smallest currency unit (cents). */
  revenue: number;
  conversions: number;
};

function TooltipRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="flex items-center gap-2">
        <span className="size-2.5 rounded-sm" style={{ background: color }} />
        {label}
      </span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

/**
 * Ranked list that shows two overlaid bars per row: the primary metric and
 * revenue, each scaled to its own maximum. The primary metric is visitors by
 * default, or page views when `metric` is `"views"`. The hover tooltip breaks
 * down both metrics plus the derived revenue-per-user and conversion rate.
 */
export function DualBarList({
  items,
  emptyLabel = "No data yet",
  currency = "usd",
  metric = "visitors",
}: {
  items: DualBarListItem[];
  emptyLabel?: string;
  currency?: string;
  metric?: "visitors" | "views";
}) {
  const isViews = metric === "views";
  const primaryValue = (item: DualBarListItem) => (isViews ? item.pageViews : item.visitors);
  const primaryColor = isViews ? ANALYTICS_COLORS.views : ANALYTICS_COLORS.visitors;
  const PrimaryIcon = isViews ? Eye : Users;
  const primaryLabel = isViews ? "Page views" : "Visitors";

  const maxPrimary = items.reduce((acc, item) => Math.max(acc, primaryValue(item)), 0) || 1;
  const maxRevenue = items.reduce((acc, item) => Math.max(acc, item.revenue), 0) || 1;

  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => {
        const revPerUser = item.users > 0 ? item.revenue / item.users : 0;
        const conversionRate = item.visitors > 0 ? (item.conversions / item.visitors) * 100 : 0;
        const primaryWidth = Math.max((primaryValue(item) / maxPrimary) * 100, 2);
        const revenueWidth = item.revenue > 0 ? Math.max((item.revenue / maxRevenue) * 100, 2) : 0;

        return (
          <Tooltip key={item.key}>
            <TooltipTrigger asChild>
              <div className="relative flex h-9 cursor-default items-center justify-between overflow-hidden rounded-md px-2 text-sm">
                <div
                  className="absolute inset-y-0 left-0 rounded-md"
                  style={{ width: `${revenueWidth}%`, backgroundColor: ANALYTICS_COLORS.revenue, opacity: 0.22 }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-md"
                  style={{ width: `${primaryWidth}%`, backgroundColor: primaryColor, opacity: 0.28 }}
                />
                <span className="relative z-10 flex min-w-0 items-center gap-2 pr-4 font-medium" title={item.hint ?? item.label}>
                  {item.icon ? <span className="shrink-0 text-muted-foreground">{item.icon}</span> : null}
                  <span className="truncate">{item.label}</span>
                </span>
                <span className="relative z-10 flex shrink-0 items-center gap-1.5 tabular-nums text-muted-foreground">
                  <PrimaryIcon className="size-3.5" />
                  {formatNumber(primaryValue(item))}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="min-w-52 border bg-popover p-3 text-xs text-popover-foreground">
              <div className="mb-2 flex items-center gap-2 border-b pb-2 font-medium">
                {item.icon ? <span>{item.icon}</span> : null}
                <span>{item.label}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <TooltipRow color={primaryColor} label={primaryLabel} value={formatNumber(primaryValue(item))} />
                <TooltipRow color={ANALYTICS_COLORS.revenue} label="Revenue" value={formatCurrency(item.revenue, currency)} />
              </div>
              <div className="mt-2 flex flex-col gap-0.5 border-t pt-2 text-muted-foreground">
                <div className="flex items-center justify-between gap-6">
                  <span>Revenue/user</span>
                  <span className="tabular-nums text-popover-foreground">{formatCurrencyPrecise(revPerUser, currency)}</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span>Conversion rate</span>
                  <span className="tabular-nums text-popover-foreground">{conversionRate.toFixed(2)}%</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
