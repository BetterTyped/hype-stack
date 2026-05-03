import path from "path";
import { defineConfig } from "vitest/config";

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  test: {
    // Enable global test functions (describe, it, expect, etc.)
    globals: true,

    // Test environment configuration
    env: {
      NODE_ENV: "test",
      POSTGRES_HOST: "localhost",
      POSTGRES_PORT: "5434",
      POSTGRES_DB: "hype-stack_test",
      POSTGRES_USER: "ai_user",
      POSTGRES_PASSWORD: "ai_password",
      DATABASE_URL: "postgresql://ai_user:ai_password@localhost:5434/hype-stack_test",
      VALKEY_URL: "valkey://localhost:6380",
      VALKEY_PASSWORD: "", // No password for test Valkey
      TEMPORAL_ADDRESS: "localhost:7234",
      TEMPORAL_NAMESPACE: "default",
      LOG_LEVEL: "error",
    },

    // Test execution configuration
    testTimeout: 30000, // 30 seconds for integration tests
    hookTimeout: 30000,
    teardownTimeout: 30000,
    fileParallelism: false, // Run test files sequentially to avoid database conflicts

    // Test file patterns - support colocated tests under src as well as legacy tests
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
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

  // Path resolution
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
