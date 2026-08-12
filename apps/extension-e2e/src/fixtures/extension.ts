import { test as base, chromium, type BrowserContext } from "@playwright/test";
import path from "node:path";

// Built by `nx run @hype-stack/extension:build`; the playwright webServer's
// preview target depends on that build, so it exists by the time tests run.
const extensionPath = path.resolve(import.meta.dirname, "../../../extension/dist/chrome");

// Playwright calls the fixture's second argument `use`; that name trips the
// react-hooks lint rule, so it is named `provide` here.
export const test = base.extend<{ context: BrowserContext; extensionId: string }>({
  // oxlint-disable-next-line no-empty-pattern
  context: async ({}, provide) => {
    const context = await chromium.launchPersistentContext("", {
      // The `chromium` channel supports loading extensions in headless mode.
      channel: "chromium",
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    });
    await provide(context);
    await context.close();
  },
  extensionId: async ({ context }, provide) => {
    // The MV3 background service worker's URL carries the extension id.
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent("serviceworker");
    }
    await provide(new URL(background.url()).host);
  },
});

export const expect = test.expect;
