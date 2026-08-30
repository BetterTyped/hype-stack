export const SITEMAP_PATH = "/sitemap.xml";
export const ROBOTS_PATH = "/robots.txt";

/**
 * Only the production deployment invites crawlers. Preview and staging builds
 * serve the same code on a public URL, and getting those indexed splits ranking
 * between hosts and leaks unfinished pages into search results - so everything
 * that is not production answers with a blanket disallow.
 */
export const buildRobotsTxt = (origin: string, isIndexable: boolean): string => {
  if (!isIndexable) {
    return ["User-agent: *", "Disallow: /", ""].join("\n");
  }

  return ["User-agent: *", "Allow: /", "", `Sitemap: ${origin}${SITEMAP_PATH}`, ""].join("\n");
};
