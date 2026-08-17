import { paraglideVitePlugin } from "@inlang/paraglide-js";
import path from "node:path";

/**
 * The paraglide compiler, as a Vite plugin.
 *
 * `src/paraglide` is generated and gitignored, so whatever resolves
 * `./paraglide/*` has to compile it first: the bundler for a build, the dev
 * server for `serve`, and Vitest for a test run. All of them build the plugin
 * from here so their options cannot drift.
 */
export function paraglidePlugin() {
  return paraglideVitePlugin({
    project: path.join(__dirname, "../project.inlang"),
    outdir: path.join(__dirname, "../src/paraglide"),
    // The same resolution order the SSR server uses: the locale cookie the
    // apps set, then the Accept-Language header, then the base locale.
    strategy: ["cookie", "preferredLanguage", "baseLocale"],
    // This bundle only ever runs on the server, so the client half of the
    // runtime is compiled out.
    isServer: "true",
    // The tsconfigs do not enable allowJs, so the emitted JS is typed through
    // its declaration files instead of JSDoc inference.
    emitTsDeclarations: true,
  });
}
