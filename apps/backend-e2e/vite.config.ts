import * as path from "path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

// eslint-disable-next-line import/no-default-export
export default defineConfig(() => ({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/packages/enums",
  plugins: [dts({ entryRoot: "src", tsconfigPath: path.join(__dirname, "tsconfig.lib.json") })],
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
}));
