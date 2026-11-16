import { test, expect } from "@playwright/test";
import { seedVocabulary } from "./fixtures/vocabulary";
test.beforeEach(async ({ page }) => { await seedVocabulary(page); });

test("all pages fit phone, tablet and desktop without client errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  for (const width of [320, 390, 768, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/vocabulary", "/flashcards", "/flashcards/study?topic=fixture-topic-0", "/games", "/exercises", "/progress"]) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator("main h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}px`).toBe(true);
      const nav = page.getByRole("navigation", { name: "Điều hướng chính" });
      await expect(nav.locator('a[aria-current="page"]')).toHaveAttribute("href", route.startsWith("/flashcards") ? "/flashcards" : route);
    }
  }
  expect(errors).toEqual([]);
});

test("keyboard skip link, Enter/Space and reduced motion work without card outlines", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/flashcards/study?topic=fixture-topic-0");
  await expect(page.getByRole("combobox", { name: "Trạng thái", exact: true })).toBeEnabled();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Đến nội dung chính", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  const card = page.locator("button.flip-card");
  await card.focus(); await page.keyboard.press("Enter");
  await expect(card).toHaveAttribute("aria-pressed", "true");
  await expect(card).toHaveCSS("outline-style", "none");
  await expect(page.locator(".flip-card-rotor")).toHaveCSS("transition-duration", "0s");
  await page.keyboard.press("Space");
  await expect(card).toHaveAttribute("aria-pressed", "false");
});

test("corrupt storage recovers explicitly and progress updates across tabs", async ({ page, context }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("corrupt-seeded")) {
      localStorage.setItem("deutsch-quest-progress-v1", "not-json");
      sessionStorage.setItem("corrupt-seeded", "yes");
    }
  });
  await page.goto("/flashcards/study?topic=fixture-topic-0");
  await expect(page.getByRole("alert").filter({ hasText: "Không đọc được tiến độ" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("deutsch-quest-progress-v1"))).toBe("not-json");
  await page.getByRole("button", { name: "✓ Đã nhớ", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Không đọc được tiến độ" })).toHaveCount(0);
  const second = await context.newPage();
  await second.goto("/flashcards/study?topic=fixture-topic-0");
  await expect(second.getByRole("button", { name: "✓ Đã nhớ", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "↻ Cần ôn", exact: true }).click();
  await expect(second.getByRole("button", { name: "↻ Cần ôn", exact: true })).toHaveAttribute("aria-pressed", "true");
  await second.close();
});

test("browser speech stops when changing cards and unsupported APIs stay usable", async ({ page }) => {
  await page.addInitScript(`
    window.__spoken = [];
    const synth = new EventTarget();
    synth.cancel = () => { window.__cancelled = true; };
    synth.speak = u => window.__spoken.push(u.text);
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class { constructor(text) { this.text = text; } } });
  `);
  await page.goto("/flashcards/study?topic=fixture-topic-0");
  await expect(page.getByRole("combobox", { name: "Trạng thái", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Nghe từ Hallo", exact: true }).click();
  expect(await page.evaluate("window.__spoken")).toEqual(["Hallo"]);
  await page.getByRole("button", { name: "Thẻ tiếp →", exact: true }).click();
  expect(await page.evaluate("window.__cancelled")).toBe(true);
  await page.evaluate("Object.defineProperty(window, 'speechSynthesis', {value: undefined})");
  await page.getByRole("button", { name: "Nghe từ danke", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Trình duyệt không hỗ trợ giọng tổng hợp." })).toBeVisible();
  await page.locator("button.flip-card").click();
  await expect(page.locator("button.flip-card")).toHaveAttribute("aria-pressed", "true");
});

test("speech retries with the browser default voice when German synthesis fails", async ({ page }) => {
  await page.addInitScript(`
    window.__attempts = [];
    const defaultVoice = { default: true, lang: 'en-US' };
    const synth = new EventTarget();
    synth.getVoices = () => [defaultVoice];
    synth.cancel = () => {};
    synth.speak = utterance => {
      window.__attempts.push({ lang: utterance.lang, defaultVoice: utterance.voice === defaultVoice });
      if (window.__attempts.length === 1) utterance.onerror?.({ error: 'language-unavailable' });
    };
    Object.defineProperty(window, 'speechSynthesis', { value: synth });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class { constructor(text) { this.text = text; } } });
  `);
  await page.goto("/flashcards/study?topic=fixture-topic-0");
  await expect(page.getByRole("combobox", { name: "Trạng thái", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Nghe từ Hallo", exact: true }).click();
  await expect.poll(() => page.evaluate("window.__attempts")).toEqual([
    { lang: "de-DE", defaultVoice: false },
    { lang: "en-US", defaultVoice: true },
  ]);
});

test("unknown route is a real localized 404 with a way home", async ({ page }) => {
  const response = await page.goto("/missing-learning-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Không tìm thấy trang", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Về tổng quan →", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("active game boards fit a small phone including long German nouns", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  for (const name of ["nối từ", "chọn nghĩa", "nghe đoán từ", "sắp xếp chữ"]) {
    await page.goto("/games");
    await page.getByRole("combobox", { name: "Chủ đề", exact: true }).selectOption("Gia đình");
    await page.getByRole("button", { name: `Chơi ${name} →`, exact: true }).click();
    await expect(page.locator("main section")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), name).toBe(true);
  }
});
