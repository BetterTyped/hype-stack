import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";

import { buildSitemapXml, collectSitemapEntries } from "./sitemap";

/**
 * Builds a real router from a real route tree - the same shape the app ships -
 * so the collector is exercised against the router's own path table rather than
 * a hand-written stand-in that could drift from it.
 */
const createTestRouter = () => {
  const rootRoute = createRootRoute();

  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/" });
  const pricingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/pricing",
    staticData: { sitemap: { changeFrequency: "weekly", priority: 0.8 } },
  });
  const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings",
    staticData: { sitemap: false },
  });
  const postsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/posts" });
  const postRoute = createRoute({ getParentRoute: () => postsRoute, path: "/$postId" });
  const feedRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/feed.xml",
    server: { handlers: { GET: () => new Response("") } },
  });

  return createRouter({
    routeTree: rootRoute.addChildren([
      indexRoute,
      pricingRoute,
      settingsRoute,
      postsRoute.addChildren([postRoute]),
      feedRoute,
    ]),
  });
};

describe("collectSitemapEntries", () => {
  it("lists every static page in the route tree", () => {
    // Arrange
    const router = createTestRouter();

    // Act
    const entries = collectSitemapEntries(router.routesByPath);

    // Assert
    expect(entries.map((entry) => entry.path)).toStrictEqual(["/", "/pricing"]);
  });

  it("keeps routes opted out with `staticData.sitemap: false` out", () => {
    // Arrange
    const router = createTestRouter();

    // Act
    const entries = collectSitemapEntries(router.routesByPath);

    // Assert
    expect(entries.map((entry) => entry.path)).not.toContain("/settings");
  });

  it("skips dynamic routes and the layouts that wrap them", () => {
    // Arrange
    const router = createTestRouter();

    // Act
    const paths = collectSitemapEntries(router.routesByPath).map((entry) => entry.path);

    // Assert
    expect(paths).not.toContain("/posts/$postId");
    expect(paths).not.toContain("/posts");
  });

  it("skips routes that only answer with a server handler", () => {
    // Arrange
    const router = createTestRouter();

    // Act
    const paths = collectSitemapEntries(router.routesByPath).map((entry) => entry.path);

    // Assert
    expect(paths).not.toContain("/feed.xml");
  });

  it("carries the route's own sitemap options over", () => {
    // Arrange
    const router = createTestRouter();

    // Act
    const entries = collectSitemapEntries(router.routesByPath);

    // Assert
    expect(entries).toContainEqual({ path: "/pricing", changeFrequency: "weekly", priority: 0.8 });
  });
});

describe("buildSitemapXml", () => {
  it("renders absolute URLs under the given origin", () => {
    // Act
    const xml = buildSitemapXml("https://example.com", [{ path: "/" }, { path: "/pricing" }]);

    // Assert
    expect(xml).toContain("<loc>https://example.com/</loc>");
    expect(xml).toContain("<loc>https://example.com/pricing</loc>");
  });

  it("renders the optional per-entry hints", () => {
    // Act
    const xml = buildSitemapXml("https://example.com", [
      {
        path: "/pricing",
        changeFrequency: "weekly",
        priority: 0.8,
        lastModified: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);

    // Assert
    expect(xml).toContain("<lastmod>2026-01-01T00:00:00.000Z</lastmod>");
    expect(xml).toContain("<changefreq>weekly</changefreq>");
    expect(xml).toContain("<priority>0.8</priority>");
  });

  it("escapes characters that would break the document", () => {
    // Act
    const xml = buildSitemapXml("https://example.com", [{ path: "/search?q=a&b" }]);

    // Assert
    expect(xml).toContain("<loc>https://example.com/search?q=a&amp;b</loc>");
  });
});
