import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Disable cache to prevent stale test results
    cache: false,

    // Enable global test functions (describe, it, expect, etc.)
    globals: true,

    // Test environment configuration
    // Rely on dotenv-loaded env from .env.test instead of hardcoding here
    env: undefined,

    // Test execution configuration
    testTimeout: 30000, // 30 seconds for integration tests
    hookTimeout: 30000,
    teardownTimeout: 30000,
    fileParallelism: false, // Run test files sequentially to avoid database conflicts

    passWithNoTests: true,

    // Test file patterns - support colocated tests under src as well as legacy tests
    include: ["tests/**/*.test.ts", "src/**/*.test.ts", "src/**/*.spec.ts", "tests/**/*.spec.ts"],
    exclude: ["node_modules/**", "dist/**"],

    // Load global setup to stub context and manage test DB lifecycle
    setupFiles: [path.resolve(__dirname, "./src/testing/setup/setup.ts")],

    // Reporter configuration
    reporters: ["verbose"],

    // Coverage configuration (optional)
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/**", "dist/**", "tests/**", "**/*.d.ts", "**/*.config.*", "**/migrations/**"],
    },
  },

  // Path resolution - let the plugin handle @ imports for context-aware resolution
  resolve: {
    alias: {
      "@backend": path.resolve(__dirname, "./src"),
      // Ensure Prisma resolves to the generated client inside the app during tests
      "@prisma/client": path.resolve(__dirname, "./src/db/postgres/generated/client"),
      ".prisma/client": path.resolve(__dirname, "./src/db/postgres/generated/client"),
    },
  },
});
