import { expect, test } from "./fixtures/extension";

test("popup page renders the app", async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/index.html`);

  expect(await page.locator("h1").innerText()).toContain("Stop building boilerplate.");
});
