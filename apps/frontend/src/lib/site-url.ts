/**
 * Absolute URLs in `robots.txt` and `sitemap.xml` have to point at the host the
 * crawler actually asked for, and that host is not known at build time - the same
 * bundle runs on localhost, on preview URLs and on the production domain. Reading
 * it off the request keeps every environment correct with zero configuration.
 *
 * Behind a proxy (Railway, Fly, any CDN) `request.url` is the internal address,
 * so the forwarded headers win whenever they are present. Both can carry a
 * comma-separated chain when several proxies are involved; the first entry is
 * the one the client used.
 */
const firstHeaderValue = (value: string | null): string | undefined => {
  return value?.split(",")[0]?.trim() || undefined;
};

export const getSiteOrigin = (request: Request): string => {
  const url = new URL(request.url);
  const host =
    firstHeaderValue(request.headers.get("x-forwarded-host")) ??
    firstHeaderValue(request.headers.get("host")) ??
    url.host;
  const protocol = firstHeaderValue(request.headers.get("x-forwarded-proto")) ?? url.protocol.replace(":", "");

  return `${protocol}://${host}`;
};
