import { test, expect } from "@playwright/test";
import { fullWord } from "../lib/vocabulary";
import { vocabulary, seedVocabulary } from "./fixtures/vocabulary";
test.beforeEach(async ({ page }) => { await seedVocabulary(page); });

test("pixel font, large 3D flashcard, plural speech and delayed voice loading", async ({ page }) => {
  await page.addInitScript(`
    window.__spoken = [];
    window.__voices = [];
    const synth = new EventTarget();
    synth.getVoices = () => window.__voices;
    synth.cancel = () => {};
    synth.speak = u => { window.__spoken.push(u.text); setTimeout(() => u.onend?.(), 50); };
    Object.defineProperty(window, 'speechSynthesis', { value: synth });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class { constructor(text) { this.text = text; } } });
    window.__loadVoices = () => { window.__voices = [{ lang: 'de-DE' }]; synth.dispatchEvent(new Event('voiceschanged')); };
  `);
  await page.goto("/flashcards");
  await expect(page.getByRole("combobox", { name: "Trạng thái", exact: true })).toBeEnabled();
  await page.getByRole("combobox", { name: "Chủ đề", exact: true }).selectOption("Nhà cửa");
  const card = page.locator("button.flip-card");
  await expect(card).toHaveAccessibleName("Lật thẻ xem nghĩa: das Haus");
  const box = await card.boundingBox();
  expect(box!.width).toBeGreaterThan(450); expect(box!.height).toBeGreaterThanOrEqual(440);
  await page.evaluate(() => document.fonts.ready);
  expect(await page.locator("body").evaluate(el => getComputedStyle(el).fontFamily)).toContain("VT323");
  expect(await page.evaluate(() => document.fonts.check('22px "VT323"', "Tiếng Đức Häuser"))).toBe(true);
  await expect(page.getByRole("button", { name: "Nghe số nhiều die Häuser", exact: true })).toBeVisible();
  // Click the padding, rather than the text, to verify the full face is interactive.
  await card.click({ position: { x: 12, y: 12 } });
  await expect(card).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".flip-card-rotor")).toHaveClass(/is-flipped/);
  await expect(page.locator(".flip-card-back")).toContainText("die Häuser");
  await page.getByRole("button", { name: "Nghe số nhiều die Häuser", exact: true }).click();
  await expect(page.getByRole("button", { name: "Dừng die Häuser", exact: true })).toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("button", { name: "Dừng die Häuser", exact: true })).toContainText("Đang tải giọng…");
  await expect(page.getByText(/Chưa tìm thấy giọng Đức/)).toHaveCount(0);
  await page.evaluate("window.__loadVoices()");
  await expect.poll(() => page.evaluate("window.__spoken.join('|')")).toBe("die Häuser");
  await expect(card).toHaveAttribute("aria-pressed", "true");
  await card.focus(); await page.keyboard.press("Space");
  await expect(card).toHaveAttribute("aria-pressed", "false");
  await expect(card).toHaveCSS("outline-style", "none");
  await expect(page.locator(".flip-card-rotor")).toHaveCSS("transform", "none");
  const frontBox = await card.boundingBox(); expect(frontBox!.height).toBe(box!.height);
  await card.blur();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "test-results/flashcard-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/flashcard-mobile.png", fullPage: true });
});

test("matching round completes, scores once and replay starts fresh", async ({ page }) => {
  await page.goto("/games");
  await page.getByRole("combobox", { name: "Chủ đề", exact: true }).selectOption("Nhà cửa");
  await page.getByRole("button", { name: "Chơi nối từ →", exact: true }).click();
  const words = vocabulary.filter(w => w.topic === "Nhà cửa");
  for (const word of words) {
    await page.getByRole("button", { name: fullWord(word), exact: true }).click();
    await page.getByRole("button", { name: word.vietnamese, exact: true }).click();
  }
  await expect(page.getByText(/50 điểm · 5\/5/)).toBeVisible();
  await page.getByRole("button", { name: "↻ Chơi lượt mới", exact: true }).click();
  await expect(page.getByText("0/5 cặp", { exact: true })).toBeVisible();
});

test("meaning and spelling games submit once, show feedback and finish", async ({ page }) => {
  for (const mode of ["chọn nghĩa", "sắp xếp chữ"]) {
    await page.goto("/games");
    await page.getByRole("combobox", { name: "Chủ đề", exact: true }).selectOption("Nhà cửa");
    await page.getByRole("button", { name: `Chơi ${mode} →`, exact: true }).click();
    for (let i = 0; i < 5; i++) {
      if (mode === "chọn nghĩa") {
        const text = await page.locator('section > p[lang="de"]').innerText();
        const word = vocabulary.find(w => fullWord(w) === text)!;
        await page.getByRole("button", { name: word.vietnamese, exact: true }).click();
        await page.getByRole("button", { name: "Xác nhận đáp án", exact: true }).click();
        await expect(page.getByRole("button", { name: "Xác nhận đáp án", exact: true })).toBeDisabled();
      } else {
        const heading = await page.locator("section h2").innerText();
        const word = vocabulary.find(w => heading.endsWith(w.vietnamese))!;
        await page.getByRole("textbox", { name: "Từ tiếng Đức", exact: true }).fill(word.german);
        await page.getByRole("button", { name: "Kiểm tra", exact: true }).click();
      }
      await page.getByRole("button", { name: i === 4 ? "Xem kết quả →" : "Câu tiếp theo →", exact: true }).click();
    }
    await expect(page.getByText(/50 điểm · 5\/5/)).toBeVisible();
  }
});

test("listening supports skipped audio and saves missed vocabulary for review", async ({ page }) => {
  await page.goto("/games");
  await page.getByRole("combobox", { name: "Chủ đề", exact: true }).selectOption("Nhà cửa");
  await page.getByRole("button", { name: "Chơi nghe đoán từ →", exact: true }).click();
  for (let i = 0; i < 5; i++) {
    await page.getByRole("button", { name: "Bỏ qua câu này (0 điểm)", exact: true }).click();
    await page.getByRole("button", { name: i === 4 ? "Xem kết quả →" : "Câu tiếp theo →", exact: true }).click();
  }
  await expect(page.getByText(/0 điểm · 0\/5/)).toBeVisible();
  await page.getByRole("button", { name: "Đánh dấu 5 từ cần ôn", exact: true }).click();
  expect(await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem("deutsch-quest-progress-v1")!).words))).toEqual(Array(5).fill("review"));
  await page.goto("/flashcards");
  await page.getByRole("combobox", { name: "Trạng thái", exact: true }).selectOption("review");
  await expect(page.getByText("Thẻ 1 / 5", { exact: true })).toBeVisible();
});

