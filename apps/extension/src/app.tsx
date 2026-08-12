import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { useTheme } from "@/hooks/use-theme";

// Extension pages are served from chrome-extension:// (or moz-extension://)
// URLs with no server-side routing, so the router keeps history in memory -
// the same approach the frontend uses for its Electron build.
const router = createRouter({
  routeTree,
  history: createMemoryHistory({ initialEntries: ["/"] }),
});

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
