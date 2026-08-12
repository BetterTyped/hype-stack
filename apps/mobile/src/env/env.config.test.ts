import { validateEnv } from "@/env/env.config";

describe("validateEnv", () => {
  it("keeps optional values undefined instead of empty strings", () => {
    // Act
    const env = validateEnv({
      EXPO_PUBLIC_API_BASE_URL: "http://localhost:3000",
      EXPO_PUBLIC_ENVIRONMENT: "development",
      EXPO_PUBLIC_SENTRY_DNS: "",
    });

    // Assert
    expect(env.EXPO_PUBLIC_SENTRY_DNS).toBeUndefined();
  });

  it("names the offending variable when the API url is missing", () => {
    // Act & Assert
    expect(() =>
      validateEnv({
        EXPO_PUBLIC_ENVIRONMENT: "development",
      }),
    ).toThrow(/EXPO_PUBLIC_API_BASE_URL/);
  });
});
