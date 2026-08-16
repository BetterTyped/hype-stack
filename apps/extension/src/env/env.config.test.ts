import { validateEnv } from "@/env/env.config";

describe("validateEnv", () => {
  it("keeps optional values undefined instead of empty strings", () => {
    // Act
    const env = validateEnv({
      VITE_API_BASE_URL: "http://localhost:3000",
      VITE_ENVIRONMENT: "development",
      VITE_SENTRY_DNS: "",
    });

    // Assert
    expect(env.VITE_SENTRY_DNS).toBeUndefined();
  });

  it("names the offending variable when the API url is missing", () => {
    // Act & Assert
    expect(() =>
      validateEnv({
        VITE_ENVIRONMENT: "development",
      }),
    ).toThrow(/VITE_API_BASE_URL/);
  });
});
