import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Standard scaffolding for a list, settings, or single-feature page inside the
 * app shell. It renders the shared page header (icon + title + description)
 * with optional trailing actions and a toolbar slot, then the page body.
 *
 * Both layout packs ship this at the same path with the same props, so feature
 * packs can render `<PageShell ...>` without knowing which layout is
 * installed. The layout owns the chrome; the page owns the content.
 */
export interface PageShellProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Trailing controls aligned to the right of the header (create buttons, manage billing, etc.). */
  actions?: ReactNode;
  /** A row below the header for filters / search inputs. */
  toolbar?: ReactNode;
  /** Page body. */
  children: ReactNode;
  className?: string;
}

export const PageShell = ({ icon: Icon, title, description, actions, toolbar, children, className }: PageShellProps) => {
  return (
    <div className={cn("w-full space-y-8", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          </div>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>

      {toolbar ? <div className="flex flex-wrap items-center gap-3">{toolbar}</div> : null}

      {children}
    </div>
  );
};
