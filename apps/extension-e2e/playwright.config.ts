import { workspaceRoot } from "@nx/devkit";
import { nxE2EPreset } from "@nx/playwright/preset";
import { defineConfig, devices } from "@playwright/test";

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env["BASE_URL"] || "http://localhost:4500";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(import.meta.filename, { testDir: "./src" }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  /* `preview` depends on `build`, so this also produces dist/chrome for the extension project below. */
  webServer: {
    command: "npx nx run @hype-stack/extension:preview",
    url: "http://localhost:4500",
    reuseExistingServer: true,
    cwd: workspaceRoot,
  },
  projects: [
    /* The popup app served as a plain web page (vite preview), mirroring frontend-e2e. */
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /extension\.spec\.ts/,
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: /extension\.spec\.ts/,
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: /extension\.spec\.ts/,
    },

    /* The real MV3 build loaded into a persistent Chromium context (see src/fixtures/extension.ts). */
    {
      name: "chromium-extension",
      testMatch: /extension\.spec\.ts/,
    },
  ],
});
