import { createFileRoute } from "@tanstack/react-router";

import { buildRobotsTxt } from "@/lib/robots";
import { getSiteOrigin } from "@/lib/site-url";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const isIndexable = import.meta.env.VITE_ENVIRONMENT === "production";

        return new Response(buildRobotsTxt(getSiteOrigin(request), isIndexable), {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
