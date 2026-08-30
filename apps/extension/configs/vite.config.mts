import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv, type Plugin, type UserConfigFnObject } from "vite";
import svgr from "vite-plugin-svgr";

import { validateEnv } from "../src/env/env.config.js";
import { themeBootstrapScript } from "../src/lib/theme.js";
import { paraglidePlugin } from "./paraglide.config.js";

type TargetBrowser = "chrome" | "firefox";

const externalDependencies = ["@hype-stack/enums"];

const getExtensionRoot = () => {
  const cwd = process.cwd();

  if (existsSync(path.join(cwd, "configs", "vite.config.mts"))) {
    return cwd;
  }

  return path.join(cwd, "apps/extension");
};

const extensionRoot = getExtensionRoot();

// Chrome and Edge load the same MV3 build; Firefox needs an event page instead
// of a service worker plus a gecko id, so it gets its own manifest (and outDir).
const getTargetBrowser = (): TargetBrowser => (process.env.TARGET_BROWSER === "firefox" ? "firefox" : "chrome");

const buildManifest = ({
  browser,
  version,
  apiOrigin,
}: {
  browser: TargetBrowser;
  version: string;
  apiOrigin: string;
}) => ({
  manifest_version: 3,
  name: "Hype Stack",
  description: "Create your own hype-stack!",
  version,
  action: {
    default_title: "Hype Stack",
    default_popup: "index.html",
  },
  icons: {
    "16": "assets/favicon-16x16.png",
    "32": "assets/favicon-32x32.png",
    "192": "assets/android-chrome-192x192.png",
    "512": "assets/android-chrome-512x512.png",
  },
  permissions: ["storage"],
  // The popup calls the backend cross-origin with credentials; host permissions
  // exempt those requests from CORS in all three browsers.
  host_permissions: [`${apiOrigin}/*`],
  ...(browser === "firefox"
    ? {
        background: { scripts: ["background.js"], type: "module" },
        browser_specific_settings: {
          gecko: { id: "extension@hype-stack.dev", strict_min_version: "121.0" },
        },
      }
    : {
        background: { service_worker: "background.js", type: "module" },
      }),
});

const manifestPlugin = ({ browser, version, apiOrigin }: Parameters<typeof buildManifest>[0]): Plugin => ({
  name: "hype-stack:extension-manifest",
  apply: "build",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "manifest.json",
      source: JSON.stringify(buildManifest({ browser, version, apiOrigin }), null, 2),
    });
  },
});

/**
 * The theme has to be applied before first paint. MV3 forbids inline scripts on
 * extension pages (`script-src 'self'`), so unlike the frontend the bootstrap
 * script is emitted as a real file and referenced with a blocking script tag.
 * The dev server is a plain web page, so there it can stay inline.
 */
const themeBootstrapPlugin = (): Plugin => {
  let isBuild = false;

  return {
    name: "hype-stack:theme-bootstrap",
    configResolved(config) {
      isBuild = config.command === "build";
    },
    buildStart() {
      if (isBuild) {
        this.emitFile({ type: "asset", fileName: "theme-bootstrap.js", source: themeBootstrapScript });
      }
    },
    transformIndexHtml: () => [
      isBuild
        ? { tag: "script", attrs: { src: "/theme-bootstrap.js" }, injectTo: "head-prepend" as const }
        : { tag: "script", children: themeBootstrapScript, injectTo: "head-prepend" as const },
    ],
  };
};

// eslint-disable-next-line import/no-default-export
export default defineConfig(({ mode }) => {
  // Env can come from a local file (dev) or purely from process.env (CI).
  // validateEnv throws a precise error listing any missing VITE_* vars.
  const env = validateEnv({
    ...loadEnv(mode, extensionRoot, ""),
    ...process.env,
  });
  const packageJson = JSON.parse(readFileSync(path.resolve(extensionRoot, "package.json"), "utf-8")) as {
    version?: string;
  };
  const appVersion = packageJson.version ?? "0.0.0";
  const targetBrowser = getTargetBrowser();
  const apiOrigin = new URL(env.VITE_API_BASE_URL).origin;

  const plugins = [
    // Messages compile to ESM message functions, so the compiler has to run
    // before bundling - the same plugin also serves Vitest and the dev server.
    paraglidePlugin(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: false,
      routesDirectory: path.join(__dirname, "../src/routes"),
      generatedRouteTree: path.join(__dirname, "../src/routeTree.gen.ts"),
      quoteStyle: "double",
    }),
    themeBootstrapPlugin(),
    manifestPlugin({ browser: targetBrowser, version: appVersion, apiOrigin }),
    tailwindcss(),
    react({ compiler: true }),
    svgr(),
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
    // with the extension project so cache-clearing scripts hit the right dir.
    cacheDir: path.resolve(__dirname, "../node_modules/.vite"),
    server: {
      port: 4400,
      host: "localhost",
      // Build output lives inside the project, so watching it both wastes file
      // descriptors and makes a production build retrigger the dev server.
      watch: { ignored: ["**/dist/**", "**/out/**"] },
    },
    preview: {
      port: 4500,
      host: "localhost",
    },
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
    optimizeDeps: {
      // These are local workspace packages (often symlinked). Pre-bundling them can cause
      // "Outdated Optimize Dep" loops after changes in monorepo packages.
      exclude: externalDependencies,
    },
    build: {
      sourcemap: true,
      outDir: `./dist/${targetBrowser}`,
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        input: {
          index: path.resolve(extensionRoot, "index.html"),
          background: path.resolve(extensionRoot, "src/background.ts"),
        },
        output: {
          // The manifest points at background.js by name, so that entry cannot
          // be hashed; everything else keeps Vite's default naming.
          entryFileNames: (chunk) => (chunk.name === "background" ? "background.js" : "assets/[name]-[hash].js"),
        },
      },
    },
    envDir: extensionRoot,
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
  } as ReturnType<UserConfigFnObject>;
});
