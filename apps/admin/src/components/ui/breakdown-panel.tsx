import { type ReactNode, useState } from "react";

import { Card } from "@/components/ui/card";
import { ANALYTICS_COLORS } from "@/lib/analytics-colors";
import { cn } from "@/lib/utils";

export type BreakdownPanelTab = {
  id: string;
  label: string;
  content: ReactNode;
  /** Header legend shown when this tab is active. Falls back to the panel-level action. */
  action?: ReactNode;
};

/** Legend for the right side of a panel header: a visitors-colored dot + label. */
export function VisitorsLegend() {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-sm" style={{ backgroundColor: ANALYTICS_COLORS.visitors }} />
      Number of Visitors
    </span>
  );
}

/** Legend for the right side of a panel header: a views-colored dot + label. */
export function ViewsLegend() {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-sm" style={{ backgroundColor: ANALYTICS_COLORS.views }} />
      Number of Views
    </span>
  );
}

/**
 * Card with a tab strip in its header that swaps the body content. Used for the
 * dashboard acquisition/locations/pages/tech breakdowns. A single-tab panel
 * still renders its label as a static heading.
 */
export function BreakdownPanel({
  tabs,
  defaultTabId,
  action,
}: {
  tabs: BreakdownPanelTab[];
  defaultTabId?: string;
  action?: ReactNode;
}) {
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);
  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  if (!activeTab) return null;

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-center justify-between gap-3 border-b px-4 pt-3">
        <div className="flex items-center gap-1 text-sm">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveId(tab.id)}
                className={cn(
                  "relative -mb-px border-b-2 px-1 pb-2.5 font-medium transition-colors",
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {(activeTab.action ?? action) ? (
          <div className="pb-2.5 text-xs text-muted-foreground">{activeTab.action ?? action}</div>
        ) : null}
      </div>
      <div className="p-4">{activeTab.content}</div>
    </Card>
  );
}
