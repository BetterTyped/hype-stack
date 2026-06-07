import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn, formatPercent } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  hint,
  invertDelta = false,
}: {
  label: string;
  value: string;
  delta?: number | null;
  icon?: LucideIcon;
  hint?: string;
  /** For metrics where a decrease is good (e.g. bounce rate), flip the color. */
  invertDelta?: boolean;
}) {
  const rising = (delta ?? 0) >= 0;
  const isPositive = invertDelta ? !rising : rising;

  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
        </div>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <div className="flex items-center gap-2 text-xs">
          {typeof delta === "number" || delta === null ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                isPositive ? "text-emerald-500" : "text-destructive",
              )}
            >
              {rising ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {formatPercent(delta)}
            </span>
          ) : null}
          {hint ? <span className="text-muted-foreground">{hint}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
