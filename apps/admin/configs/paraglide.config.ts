import { paraglideVitePlugin } from "@inlang/paraglide-js";
import path from "node:path";

/**
 * The paraglide compiler, as a Vite plugin.
 *
 * `src/paraglide` is generated and gitignored, so whatever resolves
 * `@/paraglide/*` has to compile it first: the bundler for a build, the dev
 * server for `serve`, and Vitest for a test run. All of them build the plugin
 * from here so their options cannot drift.
 *
 * They did drift. Only the Vite configs knew about the compiler, so `pnpm test`
 * on a fresh clone failed with "Failed to resolve import
 * @/paraglide/messages.js" for every component that reads a message, and passed
 * again as soon as something else had happened to generate the directory.
 */
export function paraglidePlugin() {
  return paraglideVitePlugin({
    project: path.join(__dirname, "../project.inlang"),
    outdir: path.join(__dirname, "../src/paraglide"),
    strategy: ["cookie", "preferredLanguage", "baseLocale"],
    // Lets the bundler drop the server half of the runtime from client bundles.
    isServer: "import.meta.env.SSR",
    // The tsconfigs do not enable allowJs, so the emitted JS is typed through
    // its declaration files instead of JSDoc inference.
    emitTsDeclarations: true,
  });
}
