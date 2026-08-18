import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { transformWithOxc } from "vite";
import { reactNative } from "vitest-native";
import { defineConfig, type Plugin } from "vitest/config";

import { paraglidePlugin } from "./configs/paraglide.config";
import packageJson from "./package.json";

/*
 * These packages ship raw JSX (or require react-native from outside the
 * engine-managed graph) in their published output, so the native engine has to
 * transform them while loading - the Vitest equivalent of Jest's
 * transformIgnorePatterns allowlist. The @rn-primitives list is derived from
 * package.json so newly installed primitives are covered automatically.
 */
const untranspiledPackages = [
  ...Object.keys(packageJson.dependencies).filter((name) => name.startsWith("@rn-primitives/")),
  // Transitive primitives: not direct dependencies, so not in the list above.
  "@rn-primitives/hooks",
  "@rn-primitives/types",
  "@rn-primitives/utils",
  "nativewind",
  "react-native-css-interop",
];

/*
 * Forces @rn-primitives onto its ESM build. The engine's Metro-style resolution
 * lands on the CJS dist, whose tsup interop turns `import * as AvatarPrimitive`
 * into `{ default, module.exports }` and every member access into undefined - so
 * <AvatarPrimitive.Root /> renders as an undefined element type and every
 * primitive-based component (Avatar, Dialog, Select, ...) fails to render.
 */
function rnPrimitivesEsmResolver(): Plugin {
  return {
    name: "hype-stack:rn-primitives-esm",
    enforce: "pre",
    resolveId(id, importer) {
      if (!/^@rn-primitives\/[^/]+$/.test(id)) return null;
      const from = importer && !importer.startsWith("\0") ? importer : path.join(__dirname, "__resolve__.js");
      const cjsEntry = createRequire(from).resolve(id);
      const esmEntry = cjsEntry.replace(/\.js$/, ".mjs");
      return existsSync(esmEntry) ? esmEntry : cjsEntry;
    },
  };
}

/* The ESM dists above still carry raw JSX; run them through oxc since Vite only transforms source files. */
function rnPrimitivesJsxPlugin(): Plugin {
  return {
    name: "hype-stack:rn-primitives-jsx",
    transform(code, id) {
      if (!id.includes("@rn-primitives")) return null;
      if (!id.endsWith(".js") && !id.endsWith(".mjs")) return null;
      return transformWithOxc(code, id, { lang: "jsx", jsx: { runtime: "automatic" } });
    },
  };
}

/*
 * The project setup file imports nativewind, which can only load after
 * vitest-native's own auto-injected setup has installed the react-native
 * require hook. Injecting our setup through a plugin placed after
 * reactNative() merges it behind the plugin's, guaranteeing that order -
 * listing it in `test.setupFiles` directly would make it run first and crash
 * on react-native's untranspiled Flow syntax.
 */
const projectSetup = (): Plugin => ({
  name: "hype-stack:project-setup",
  config: () => ({
    test: { setupFiles: [path.resolve(__dirname, "src/testing/setup/setup.ts")] },
  }),
});

export default defineConfig({
  // The native engine runs the real React Native JavaScript and mocks only the
  // native-module boundary. Reanimated, AsyncStorage, safe-area, screens, and
  // the Expo modules are shadowed by auto-detected presets - no manual mocks.
  // Tests import messages like anything else, and `src/paraglide` is generated,
  // so the compiler runs here too — otherwise a fresh clone cannot resolve
  // `@/paraglide/*` until some other command happens to have written it.
  plugins: [
    rnPrimitivesEsmResolver(),
    rnPrimitivesJsxPlugin(),
    reactNative({ engine: "native", transform: untranspiledPackages }),
    projectSetup(),
    paraglidePlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    watch: false,
    globals: true,
    env: {
      EXPO_PUBLIC_API_BASE_URL: "http://localhost:3000",
      EXPO_PUBLIC_ENVIRONMENT: "test",
    },
    passWithNoTests: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "./test-output/vitest/coverage",
      provider: "v8" as const,
    },
    server: {
      deps: {
        // Keep the primitives in the Vite pipeline: externalized to Node, their tsup CJS
        // re-export helpers defeat the CJS named-export lexer and `import *` comes back empty.
        inline: [/@rn-primitives\//],
      },
    },
  },
});
