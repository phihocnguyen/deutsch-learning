import { test, expect } from "@playwright/test";
import { seedVocabulary } from "./fixtures/vocabulary";
test.beforeEach(async ({ page }) => { await seedVocabulary(page); });

test("wide layouts fill the screen and filters align without a search outline", async ({ page }) => {
  for (const width of [1366, 1920, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/vocabulary");
    const input = page.getByRole("textbox", { name: "Tìm từ" });
    await expect(input).toBeEnabled();
    await page.evaluate(() => document.fonts.ready);
    const boxes = await page.locator(".learning-filters .vocabulary-filter").evaluateAll(fields => fields.map(field => {
      const { y, height } = field.getBoundingClientRect();
      return { y, height };
    }));
    expect(boxes).toHaveLength(3);
    expect(boxes[1]).toEqual(boxes[0]);
    expect(boxes[2]).toEqual(boxes[0]);
    await input.focus();
    await expect(input).toHaveCSS("outline-style", "none");
    for (const select of await page.locator(".learning-filters select").all()) {
      await select.focus();
      await expect(select).toHaveCSS("outline-style", "none");
    }
    expect(await page.evaluate(() => {
      const main = document.querySelector("main")!.getBoundingClientRect();
      return Math.abs(main.right - document.body.getBoundingClientRect().right) < 1;
    })).toBe(true);
  }
});

test("sidebar stays in place when switching between long and short pages", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/vocabulary");
  await expect(page.getByRole("textbox", { name: "Tìm từ" })).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);
  const positions = () => page.locator("aside").evaluate(aside =>
    [aside, ...aside.querySelectorAll("nav a")].map(element => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x: Math.round(x), y: Math.round(y) || 0, width: Math.round(width), height: Math.round(height) };
    }));
  const before = await positions();
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.locator('nav a[href="/exercises"]').click();
  await expect(page.locator('nav a[href="/exercises"]')).toHaveAttribute("aria-current", "page");
  await expect.poll(positions).toEqual(before);
  await page.locator('nav a[href="/vocabulary"]').click();
  await expect(page.getByRole("textbox", { name: "Tìm từ" })).toBeVisible();
  await expect.poll(positions).toEqual(before);
});
