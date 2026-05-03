import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@/assets": path.resolve(__dirname, "assets"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: "jsdom",
    env: {
      VITE_API_BASE_URL: "http://localhost:3000",
      VITE_APP_TYPE: "web",
      VITE_ENVIRONMENT: "test",
    },
    include: ["{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    setupFiles: [path.resolve(__dirname, "src/testing/setup/setup.ts")],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "./test-output/vitest/coverage",
      provider: "v8" as const,
    },
  },
});
