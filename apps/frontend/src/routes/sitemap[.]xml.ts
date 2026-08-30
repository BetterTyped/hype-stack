import { createFileRoute } from "@tanstack/react-router";

import { getSiteOrigin } from "@/lib/site-url";
import { buildSitemapXml, collectSitemapEntries, type SitemapEntry } from "@/lib/sitemap";
import { getRouter } from "@/router";

/**
 * The route tree is fixed once the bundle is built, so the entries are computed
 * on the first request and reused. The router is built here rather than taken
 * from `getRouterInstance()` because that import pulls `node:async_hooks` into
 * every route file, and the CSR and Electron builds - same routes directory, no
 * Start plugin to strip server code out - cannot bundle that.
 */
let cachedEntries: SitemapEntry[] | undefined;

const getEntries = (): SitemapEntry[] => {
  cachedEntries ??= collectSitemapEntries(getRouter().routesByPath);

  return cachedEntries;
};

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        return new Response(buildSitemapXml(getSiteOrigin(request), getEntries()), {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
