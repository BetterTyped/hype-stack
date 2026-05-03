import { createRootRoute, Outlet } from "@tanstack/react-router";

import { AppError } from "@/components/errors/app-error";
import { NotFound } from "@/components/errors/not-found";
import { Providers } from "@/components/providers/providers";

export const Route = createRootRoute({
  notFoundComponent: NotFound,
  errorComponent: AppError,
  component: Root,
});

function Root() {
  return (
    <Providers>
      <Outlet />
    </Providers>
  );
}
