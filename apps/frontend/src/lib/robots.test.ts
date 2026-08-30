import { buildRobotsTxt } from "./robots";

describe("buildRobotsTxt", () => {
  it("opens the site up and points at the sitemap in production", () => {
    // Act
    const robots = buildRobotsTxt("https://example.com", true);

    // Assert
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Sitemap: https://example.com/sitemap.xml");
  });

  it("blocks crawlers everywhere else so preview hosts stay unindexed", () => {
    // Act
    const robots = buildRobotsTxt("https://preview.example.com", false);

    // Assert
    expect(robots).toContain("Disallow: /");
    expect(robots).not.toContain("Sitemap:");
  });
});
