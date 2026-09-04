import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "**/vite.config.{mjs,js,ts,mts}",
      "**/vitest.config.{mjs,js,ts,mts}",
      "!apps/backend/vite.config.ts",
      "!apps/backend-e2e/vite.config.ts",
      "!vitest.config.ts",
    ],
  },
});
