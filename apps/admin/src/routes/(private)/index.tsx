// oxlint-disable react/no-array-index-key
import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboardIcon } from "lucide-react";

import { PageShell } from "@/components/layouts/shells/page-shell";
import { dashboardRows } from "@/features/dashboard/constants/dashboard.rows";

export const Route = createFileRoute("/(private)/")({
  loader: () => ({ crumb: "Dashboard" }),
  component: () => (
    <PageShell
      icon={LayoutDashboardIcon}
      title="Welcome back"
      description="Your at-a-glance overview of key metrics, recent activity, and everything that needs your attention."
    >
      {dashboardRows.map((Row, index) => (
        <Row key={String(index)} />
      ))}
    </PageShell>
  ),
});
