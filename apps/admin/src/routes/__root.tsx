import { createRootRoute, Link } from "@tanstack/react-router";

import { AppLoader } from "@/components/layouts/app-loader/app-loader";
import { PageLayout } from "@/components/layouts/page/layout";
import { LayoutSlotsProvider } from "@/components/layouts/page/page-shell";
import { Button } from "@/components/ui/button";
import { Providers } from "@/components/providers/providers";
import { DateRangeProvider } from "@/contexts/date-range";

export const Route = createRootRoute({
  notFoundComponent: NotFound,
  component: Root,
});

function Root() {
  return (
    <Providers>
      <AppLoader />
      <DateRangeProvider>
        <LayoutSlotsProvider>
          <PageLayout />
        </LayoutSlotsProvider>
      </DateRangeProvider>
    </Providers>
  );
}

function NotFound() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Button asChild>
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
