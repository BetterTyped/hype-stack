import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/")({
  loader: () => ({ crumb: "Dashboard" }),
  component: () => <div>Dashboard</div>,
});
