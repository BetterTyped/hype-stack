import type { AnyRoute } from "@tanstack/router-core";

export type SitemapChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export interface SitemapRouteOptions {
  changeFrequency?: SitemapChangeFrequency;
  /** 0.0 - 1.0, relative to the other pages of this site. Crawlers treat it as a hint. */
  priority?: number;
  lastModified?: Date | string;
}

declare module "@tanstack/router-core" {
  interface StaticDataRouteOption {
    /**
     * How the route shows up in `/sitemap.xml`. Every static page is listed by
     * default, so this is only needed to tune an entry - or to set `false` and
     * keep a page out entirely, which is what anything behind a login wants:
     *
     * ```ts
     * export const Route = createFileRoute("/(private)/settings/")({
     *   staticData: { sitemap: false },
     * });
     * ```
     */
    sitemap?: SitemapRouteOptions | false;
  }
}

export interface SitemapEntry extends SitemapRouteOptions {
  path: string;
}

/**
 * `$postId`, `$`, `{-$locale}` - a crawler needs concrete URLs, and the values
 * that fill these live in a database this module cannot read. Routes that should
 * expand into real URLs have to be appended by whoever owns that data.
 */
const DYNAMIC_SEGMENT = /[$*{]/;

/**
 * Builds the sitemap straight from the router's own path table, so a new page
 * file is a new sitemap entry with nothing else to remember. Pass
 * `router.routesByPath` - it is keyed by full path and already has groups
 * (`(private)`) and pathless layouts (`_auth`) resolved away.
 */
export const collectSitemapEntries = (routesByPath: object): SitemapEntry[] => {
  // `routesByPath` is typed per route tree - an interface with one key per page
  // and no index signature - so it is read back as the record it is at runtime.
  const routes = Object.entries(routesByPath) as Array<[string, AnyRoute]>;
  const entries: SitemapEntry[] = [];

  for (const [path, route] of routes) {
    const options = route.options.staticData?.sitemap;

    // Opted out by hand - typically a page behind authentication.
    if (options === false) {
      continue;
    }

    if (DYNAMIC_SEGMENT.test(path)) {
      continue;
    }

    // A route with children is a layout: it wraps pages rather than being one,
    // and its own index child is already in the table under the same path.
    if (route.children?.length) {
      continue;
    }

    // Server-only routes - `/sitemap.xml` and `/robots.txt` themselves - answer
    // with a handler instead of rendering a page, so they are not URLs to crawl.
    if (!route.options.component && route.options.server?.handlers) {
      continue;
    }

    entries.push({ ...options, path: path || "/" });
  }

  return entries.toSorted((a, b) => a.path.localeCompare(b.path));
};

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

const escapeXml = (value: string): string => value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char);

const toIsoDate = (value: Date | string): string => (value instanceof Date ? value.toISOString() : value);

export const buildSitemapXml = (origin: string, entries: SitemapEntry[]): string => {
  const urls = entries.map(({ path, lastModified, changeFrequency, priority }) => {
    const lines = [`    <loc>${escapeXml(`${origin}${path}`)}</loc>`];

    if (lastModified) {
      lines.push(`    <lastmod>${escapeXml(toIsoDate(lastModified))}</lastmod>`);
    }
    if (changeFrequency) {
      lines.push(`    <changefreq>${changeFrequency}</changefreq>`);
    }
    if (priority !== undefined) {
      lines.push(`    <priority>${priority}</priority>`);
    }

    return `  <url>\n${lines.join("\n")}\n  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
};
