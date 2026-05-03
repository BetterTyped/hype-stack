import { cpSync, existsSync, readFileSync } from "fs";
import { builtinModules } from "node:module";
import * as path from "path";
import { defineConfig } from "vitest/config";

const packageJson = JSON.parse(readFileSync(path.resolve(__dirname, "package.json"), "utf-8"));
const allDependencies = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
];

const manualExternalDependencies = [
  "@sentry/node",
  "@prisma/client",
  ".prisma/client",
  /^@prisma\/client\/.*/,
  /^\.prisma\/client\/.*/,
];

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/backend",
  optimizeDeps: {
    include: ["hono", "@hono/node-server"],
  },
  plugins: [
    {
      name: "copy-prisma-client",
      writeBundle() {
        const src = path.resolve(__dirname, "src/db/postgres/generated/client");
        const dest = path.resolve(__dirname, "dist/src/db/postgres/generated/client");
        if (existsSync(src)) cpSync(src, dest, { recursive: true });
      },
    },
    {
      name: "copy-assets",
      writeBundle() {
        const src = path.resolve(__dirname, "src/assets");
        const dest = path.resolve(__dirname, "dist/src/assets");
        if (existsSync(src)) cpSync(src, dest, { recursive: true });
      },
    },
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@backend": path.resolve(__dirname, "src"),
      "@prisma/client": path.resolve(__dirname, "./src/db/postgres/generated/client"),
    },
  },
  build: {
    outDir: "dist",
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      formats: ["cjs"],
      fileName: () => "main.js",
    },
    copyPublicDir: false,
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        ...allDependencies,
        ...manualExternalDependencies,
      ],
      output: {
        paths: {
          "@prisma/client": "./src/db/postgres/generated/client",
          ".prisma/client": "./src/db/postgres/generated/client",
        },
      },
    },
    target: "node20",
    minify: false,
    sourcemap: true,
    emptyOutDir: false,
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
