import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Standard scaffolding for a detail page (a single project, team, record)
 * inside the app shell. It renders a hero card with the entity icon / title /
 * description / badge / header actions, an optional stat strip, then the page
 * body (typically a 1 or 2 column module grid).
 *
 * Both layout packs ship this at the same path with the same props, so feature
 * packs can render `<DetailPageShell ...>` without knowing which layout is
 * installed. Pass `loading` to show a skeleton hero while the record loads.
 */
export interface DetailPageStat {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}

export interface DetailPageShellProps {
  icon?: LucideIcon;
  /** Image URL rendered in place of the icon when the entity has an avatar/logo. */
  iconUrl?: string | null;
  title: string;
  description?: string;
  loading?: boolean;
  /** Pill rendered next to the title (status, role, etc.). */
  badge?: ReactNode;
  /** Trailing controls in the hero (favorite, actions dropdown, etc.). */
  headerActions?: ReactNode;
  stats?: DetailPageStat[];
  /** Page body. */
  children: ReactNode;
  className?: string;
  /** Stable selector hook for the hero card (e.g. preview tours/capture). */
  dataTour?: string;
  /** Stable selector hook for the stats strip (e.g. preview tours/capture). */
  statsDataTour?: string;
}

export const DetailPageShell = ({
  icon: Icon,
  iconUrl,
  title,
  description,
  loading,
  badge,
  headerActions,
  stats,
  children,
  className,
  dataTour,
  statsDataTour,
}: DetailPageShellProps) => {
  return (
    <div className={cn("w-full space-y-8", className)}>
      <div
        data-tour={dataTour}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-xl"
      >
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {iconUrl ? (
              <img src={iconUrl} alt="" className="size-12 rounded-xl object-cover" />
            ) : Icon ? (
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
                <Icon className="size-6" />
              </div>
            ) : null}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-semibold tracking-tight">{loading ? "Loading\u2026" : title}</h1>
                {badge ? <span className="shrink-0">{badge}</span> : null}
              </div>
              {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
            </div>
          </div>
          {headerActions ? <div className="flex items-center gap-2">{headerActions}</div> : null}
        </div>
      </div>

      {stats && stats.length > 0 ? (
        <div data-tour={statsDataTour} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card flex flex-col gap-1 rounded-xl border border-border/60 p-4">
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                <stat.icon className="size-3.5" />
                {stat.label}
              </div>
              <div className="text-foreground text-lg font-semibold">{stat.value}</div>
            </div>
          ))}
        </div>
      ) : null}

      {children}
    </div>
  );
};
