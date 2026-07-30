import { sentryVitePlugin } from "@sentry/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadEnv, type Plugin, type UserConfigFnObject } from "vite";

import { validateEnv } from "../src/env/env.config";
import { themeBootstrapScript } from "../src/lib/theme";

const externalDependencies = ["@hype-stack/enums"];

const getFrontendRoot = () => {
  const cwd = process.cwd();

  if (existsSync(path.join(cwd, "configs", "vite.base.config.ts"))) {
    return cwd;
  }

  return path.join(cwd, "apps/frontend");
};

const frontendRoot = getFrontendRoot();

/**
 * The theme has to be applied before first paint, which a bundled module cannot
 * guarantee - so index.html needs it as a blocking inline script. Injecting it
 * here keeps `@/lib/theme` the only definition; the SSR document head inlines
 * the same string from the root route.
 */
const themeBootstrapPlugin: Plugin = {
  name: "hype-stack:theme-bootstrap",
  transformIndexHtml: () => [
    {
      tag: "script",
      children: themeBootstrapScript,
      injectTo: "head-prepend",
    },
  ],
};

export const config: UserConfigFnObject & { isSsrBuild?: boolean } = ({ mode, isSsrBuild }) => {
  // Env can come from a local file (dev) or purely from process.env (CI, Railway,
  // Pages). validateEnv throws a precise error listing any missing VITE_* vars.
  const env = validateEnv({
    ...loadEnv(mode, frontendRoot, ""),
    ...process.env,
  });
  const packageJson = JSON.parse(readFileSync(path.resolve(frontendRoot, "package.json"), "utf-8")) as {
    version?: string;
  };
  const appVersion = packageJson.version ?? "0.0.0";

  const plugins = isSsrBuild
    ? [
        tanstackStart({
          router: {
            routesDirectory: path.join(__dirname, "../src/routes"),
            generatedRouteTree: path.join(__dirname, "../src/routeTree.gen.ts"),
            quoteStyle: "double",
          },
        }),
      ]
    : [
        tanstackRouter({
          target: "react",
          autoCodeSplitting: false,
          routesDirectory: path.join(__dirname, "../src/routes"),
          generatedRouteTree: path.join(__dirname, "../src/routeTree.gen.ts"),
          quoteStyle: "double",
        }),
        themeBootstrapPlugin,
      ];

  if (env.VITE_SENTRY_AUTH_TOKEN) {
    plugins.unshift(
      sentryVitePlugin({
        authToken: env.VITE_SENTRY_AUTH_TOKEN,
        org: "better-typed",
        project: "hype-stack",
        telemetry: false,
      }),
    );
  }

  return {
    // Nx can run tasks from the workspace root; keep Vite cache colocated
    // with the frontend project so our `rimraf node_modules/.vite` scripts
    // always clear the right directory.
    cacheDir: path.resolve(__dirname, "../node_modules/.vite"),
    server: {
      allowedHosts: ["hype-stack.dev"],
      // Build output lives inside the project, so watching it both wastes file
      // descriptors and makes a production build retrigger the dev server.
      watch: { ignored: ["**/.output/**", "**/dist/**", "**/.nitro/**", "**/out/**"] },
    },
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
      // Under SSR, React emits the whole document, so __root renders the
      // html/head/body wrapper. The CSR and Electron builds get that wrapper
      // from index.html and mount into #root, where a nested document would be
      // invalid - so the wrapper is compiled out of those builds.
      __SSR_SHELL__: JSON.stringify(Boolean(isSsrBuild)),
    },
    optimizeDeps: {
      // These are local workspace packages (often symlinked). Pre-bundling them can cause
      // "Outdated Optimize Dep" loops after changes in monorepo packages.
      exclude: externalDependencies,
    },
    build: {
      sourcemap: true, // Source map generation must be turned on
      // SPA builds to ./dist. SSR/Nitro manages its own output (.output);
      // pointing outDir at ./dist makes Nitro serve stale SPA index.html in dev.
      ...(isSsrBuild
        ? {}
        : {
            outDir: "./dist",
            emptyOutDir: true,
          }),
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {},
    },
    envDir: frontendRoot,
    plugins,
    resolve: {
      tsconfigPaths: true,
      alias: {
        "@/assets": path.resolve(__dirname, "../src/assets"),
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
