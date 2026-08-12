import path from "node:path";
import { defineConfig } from "vitest/config";

import { paraglidePlugin } from "./configs/paraglide.config";

export default defineConfig({
  // Tests import messages like anything else, and `src/paraglide` is generated,
  // so the compiler has to run here too. Without it a fresh clone cannot resolve
  // `@/paraglide/*` until some other command happens to have written it.
  plugins: [paraglidePlugin()],
  resolve: {
    alias: {
      "@/assets": path.resolve(__dirname, "src/assets"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: "jsdom",
    env: {
      VITE_API_BASE_URL: "http://localhost:3000",
      VITE_ENVIRONMENT: "test",
    },
    passWithNoTests: true,
    include: ["{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    setupFiles: [path.resolve(__dirname, "src/testing/setup/setup.ts")],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "./test-output/vitest/coverage",
      provider: "v8" as const,
    },
  },
});
