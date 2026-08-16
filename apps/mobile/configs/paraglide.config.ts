import { paraglideVitePlugin } from "@inlang/paraglide-js";
import path from "node:path";

/**
 * The paraglide compiler, as a Vite plugin — Vitest is the only Vite consumer
 * in this app (Metro bundles the app itself and cannot run Vite plugins, so the
 * `generate` package script compiles `src/paraglide` for it up front).
 *
 * Keep the options here and in `generate` in sync: both must emit the same
 * runtime or a test run and a device build resolve locales differently.
 */
export function paraglidePlugin() {
  return paraglideVitePlugin({
    project: path.join(__dirname, "../project.inlang"),
    outdir: path.join(__dirname, "../src/paraglide"),
    // No cookies or URLs on a device: resolve the device language, then fall back.
    strategy: ["preferredLanguage", "baseLocale"],
    // The Expo app has no SSR pass, so the server half of the runtime is dead code.
    isServer: "false",
    // The tsconfigs do not enable allowJs, so the emitted JS is typed through
    // its declaration files instead of JSDoc inference.
    emitTsDeclarations: true,
  });
}
