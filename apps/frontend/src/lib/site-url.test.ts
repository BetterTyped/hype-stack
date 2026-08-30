import { getSiteOrigin } from "./site-url";

describe("getSiteOrigin", () => {
  it("uses the host the request came in on", () => {
    // Act
    const origin = getSiteOrigin(new Request("http://localhost:4200/sitemap.xml"));

    // Assert
    expect(origin).toBe("http://localhost:4200");
  });

  it("prefers the forwarded host and protocol behind a proxy", () => {
    // Arrange
    const request = new Request("http://10.0.0.7:8080/sitemap.xml", {
      headers: { "x-forwarded-host": "example.com", "x-forwarded-proto": "https" },
    });

    // Act
    const origin = getSiteOrigin(request);

    // Assert
    expect(origin).toBe("https://example.com");
  });

  it("takes the first entry when several proxies appended to the chain", () => {
    // Arrange
    const request = new Request("http://10.0.0.7:8080/sitemap.xml", {
      headers: { "x-forwarded-host": "example.com, internal.example.com", "x-forwarded-proto": "https, http" },
    });

    // Act
    const origin = getSiteOrigin(request);

    // Assert
    expect(origin).toBe("https://example.com");
  });
});
