import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadEnv, type Plugin, type UserConfigFnObject } from "vite";

import { validateEnv } from "../src/env/env.config";
import { themeBootstrapScript } from "../src/lib/theme";

const externalDependencies = ["@hype-stack/enums"];

const getAdminRoot = () => {
  const cwd = process.cwd();

  if (existsSync(path.join(cwd, "configs", "vite.base.config.ts"))) {
    return cwd;
  }

  return path.join(cwd, "apps/admin");
};

const adminRoot = getAdminRoot();

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
  const env = validateEnv({
    ...loadEnv(mode, adminRoot, ""),
    ...process.env,
  });
  const packageJson = JSON.parse(readFileSync(path.resolve(adminRoot, "package.json"), "utf-8")) as {
    version?: string;
  };
  const appVersion = packageJson.version ?? "0.0.0";

  const plugins = isSsrBuild
    ? [
        tailwindcss(),
        tanstackStart({
          router: {
            routesDirectory: path.join(__dirname, "../src/routes"),
            generatedRouteTree: path.join(__dirname, "../src/routeTree.gen.ts"),
            quoteStyle: "double",
          },
        }),
        react(),
        // Nitro registers any index.html at the Vite root as its catch-all
        // renderer template, which preempts TanStack Start's SSR handler and
        // serves that file raw. index.html has to stay at the root for the CSR
        // build, so Nitro's renderer is what gives way.
        nitro({ renderer: false }),
      ]
    : [
        tailwindcss(),
        tanstackRouter({
          target: "react",
          autoCodeSplitting: false,
          routesDirectory: path.join(__dirname, "../src/routes"),
          generatedRouteTree: path.join(__dirname, "../src/routeTree.gen.ts"),
          quoteStyle: "double",
        }),
        react(),
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
    // with the admin project so our `rimraf node_modules/.vite` scripts
    // always clear the right directory.
    cacheDir: path.resolve(__dirname, "../node_modules/.vite"),
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
      // Under SSR, React emits the whole document, so __root renders the
      // html/head/body wrapper. The CSR build gets that wrapper from index.html
      // and mounts into #root, where a nested document would be invalid - so the
      // wrapper is compiled out of that build.
      __SSR_SHELL__: JSON.stringify(Boolean(isSsrBuild)),
    },
    server: {
      // Build output lives inside the project, so watching it both wastes file
      // descriptors and makes a production build retrigger the dev server.
      watch: { ignored: ["**/.output/**", "**/dist/**", "**/.nitro/**"] },
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
    envDir: adminRoot,
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
