import { RouterProvider, createRouter } from "@tanstack/react-router";

import { useTheme } from "@/hooks/use-theme";

import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  // Centralized theme controller - applies, persists, and syncs the theme for the whole app.
  useTheme();

  return <RouterProvider router={router} />;
}
