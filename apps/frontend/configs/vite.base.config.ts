import { sentryVitePlugin } from "@sentry/vite-plugin";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import dotenv from "dotenv";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { UserConfigFnObject } from "vite";

import { validateEnv } from "../src/env/env.config";

const externalDependencies = ["@hype-stack/enums", "@hype-stack/ui"];

const getFrontendRoot = () => {
  const cwd = process.cwd();

  if (existsSync(path.join(cwd, "configs", "vite.base.config.ts"))) {
    return cwd;
  }

  return path.join(cwd, "apps/frontend");
};

const frontendRoot = getFrontendRoot();

const getEnvFiles = (mode: string) => [".env", ".env.local", `.env.${mode}`, `.env.${mode}.local`];

const validateEnvFile = (mode: string) => {
  const hasEnvFile = getEnvFiles(mode).some((file) => existsSync(path.join(frontendRoot, file)));

  if (!hasEnvFile) {
    throw new Error(`Missing frontend environment file. Create apps/frontend/.env from apps/frontend/.env.example.`);
  }
};

const loadFrontendEnv = (mode: string) => {
  const envFromFiles = getEnvFiles(mode).reduce<Record<string, string>>((acc, file) => {
    const envPath = path.join(frontendRoot, file);
    if (!existsSync(envPath)) return acc;

    return Object.assign(acc, dotenv.config({ path: envPath, processEnv: {} }).parsed);
  }, {});

  return {
    ...envFromFiles,
    ...process.env,
  };
};

export const config: UserConfigFnObject = ({ mode }) => {
  validateEnvFile(mode);
  const env = validateEnv(loadFrontendEnv(mode));
  const packageJson = JSON.parse(readFileSync(path.resolve(frontendRoot, "package.json"), "utf-8")) as {
    version?: string;
  };
  const appVersion = packageJson.version ?? "0.0.0";

  return {
    // Nx can run tasks from the workspace root; keep Vite cache colocated
    // with the frontend project so our `rimraf node_modules/.vite` scripts
    // always clear the right directory.
    cacheDir: path.resolve(__dirname, "../node_modules/.vite"),
    server: { allowedHosts: ["workflows.hype-stack.co"] },
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
    optimizeDeps: {
      // These are local workspace packages (often symlinked). Pre-bundling them can cause
      // "Outdated Optimize Dep" loops after changes in monorepo packages.
      exclude: externalDependencies,
    },
    build: {
      sourcemap: true, // Source map generation must be turned on
      outDir: "./dist",
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {},
    },
    envDir: frontendRoot,
    plugins: [
      sentryVitePlugin({
        authToken: env.VITE_SENTRY_AUTH_TOKEN,
        org: "better-typed",
        project: "hype-stack",
        telemetry: false,
      }),
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
        routesDirectory: path.join(__dirname, "../src/routes"),
        generatedRouteTree: path.join(__dirname, "../src/routeTree.gen.ts"),
        quoteStyle: "double",
      }),
    ],
    resolve: {
      tsconfigPaths: true,
      alias: {
        "@/assets": path.resolve(__dirname, "../assets"),
        "@": path.resolve(__dirname, "../src"),
      },
    },
    test: {
      watch: false,
      globals: true,
      environment: "jsdom",
      include: ["{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      setupFiles: [path.resolve(__dirname, "../src/testing/setup/setup.ts")],
      reporters: ["default"],
      coverage: {
        reportsDirectory: "./test-output/vitest/coverage",
        provider: "v8" as const,
      },
    },
  };
};
