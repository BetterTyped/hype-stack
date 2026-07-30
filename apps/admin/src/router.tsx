import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { AppError } from "@/components/errors/app-error";
import { NotFound } from "@/components/errors/not-found";

// This is SSR router
export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: AppError,
    defaultNotFoundComponent: NotFound,
    scrollRestoration: true,
  });
  return router;
}
