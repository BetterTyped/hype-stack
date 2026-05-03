import * as path from "path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/packages/enums",
  plugins: [dts({ entryRoot: "src", tsconfigPath: path.join(__dirname, "tsconfig.lib.json") })],
  resolve: {
    alias: {
      "@enums": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "./dist",
    emptyOutDir: true,
    lib: {
      entry: "src/index.ts",
      name: "@hype-stack/enums",
      fileName: "index",
      formats: ["es" as const],
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: "node",
    include: ["{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "./test-output/vitest/coverage",
      provider: "v8" as const,
    },
  },
});
