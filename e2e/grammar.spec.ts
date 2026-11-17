import { test, expect } from "@playwright/test";
import { grammarLessons } from "../lib/grammar";
import { grammarPath } from "../lib/grammar/types";

test("grammar levels link to their lessons and every lesson has rules and exercises", async ({ page }) => {
  await page.goto("/grammar");
  await expect(page.getByRole("heading", { name: "Ngữ pháp tiếng Đức", exact: true })).toBeVisible();
  for (const [level, count] of [["a1", 14], ["a2", 15], ["b1", 3], ["b2", 1]] as const) {
    await page.goto(`/grammar/${level}`);
    await expect(page.locator(`main a[href^="/grammar/${level}?lesson="]`)).toHaveCount(count);
  }
  for (const lesson of grammarLessons) {
    await page.goto(`${grammarPath(lesson.level)}?lesson=${lesson.id}`);
    await expect(page.getByRole("heading", { name: lesson.title, exact: true })).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Phạm vi và lưu ý", exact: true })).toBeVisible();
    await expect(page.getByText(/Nguồn tham chiếu/)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Bắt đầu luyện bài", exact: true })).toBeEnabled();
  }
});

test("capitalization, first-score preservation, review and reload do not change vocabulary progress", async ({ page }) => {
  const oldProgress = { version: 1, words: { apfel: "known" } };
  await page.goto("/");
  await page.evaluate(value => localStorage.setItem("deutsch-quest-progress-v1", JSON.stringify(value)), oldProgress);
  await page.goto("/grammar/a1?lesson=a1-pronouns");
  await page.getByRole("button", { name: "Đánh dấu đã đọc", exact: true }).click();
  await page.getByRole("button", { name: "Bắt đầu luyện bài", exact: true }).click();
  const input = page.getByRole("textbox", { name: "Đáp án ngữ pháp", exact: true });
  await input.fill("bin"); await page.getByRole("button", { name: "Kiểm tra đáp án", exact: true }).click();
  await page.getByRole("button", { name: "Câu tiếp theo →", exact: true }).click();
  await page.getByRole("button", { name: "habt", exact: true }).click();
  await page.getByRole("button", { name: "Kiểm tra đáp án", exact: true }).click();
  await page.getByRole("button", { name: "Câu tiếp theo →", exact: true }).click();
  await input.fill("sie"); await page.getByRole("button", { name: "Kiểm tra đáp án", exact: true }).click();
  await expect(page.getByText("↻ Cần xem lại.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Thử lại để hiểu bài", exact: true }).click();
  await input.fill("Sie"); await page.getByRole("button", { name: "Kiểm tra đáp án", exact: true }).click();
  await page.getByRole("button", { name: "Hoàn thành & lưu ngữ pháp", exact: true }).click();
  await expect(page.getByText("2/3 câu đúng lần đầu", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Ôn 1 câu sai", exact: true }).click();
  await input.fill("Sie"); await page.getByRole("button", { name: "Kiểm tra đáp án", exact: true }).click();
  await page.getByRole("button", { name: "Hoàn thành & lưu ngữ pháp", exact: true }).click();
  await expect(page.getByText("1/1 câu đúng lần đầu", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "✓ Đã đọc · Bỏ đánh dấu", exact: true })).toHaveAttribute("aria-pressed", "true");
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("deutsch-quest-grammar-v1")!));
  expect(stored.attempts).toHaveLength(2); expect(stored.attempts[1].answers["3"]).toBe(false);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("deutsch-quest-progress-v1")!))).toEqual(oldProgress);
  await page.getByRole("link", { name: "Danh sách A1", exact: true }).click();
  await expect(page.locator('a[href="/grammar/a1?lesson=a1-pronouns"]')).toHaveCSS("background-color", "rgb(231, 239, 220)");
  await expect(page.getByText("3/3 câu đúng ở lần luyện gần nhất của từng câu", { exact: true })).toBeVisible();
  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: "Tiến độ ngữ pháp", exact: true })).toBeVisible();
});

test("A2 practice and browser back work with shareable lesson links", async ({ page }) => {
  await page.goto("/grammar/a2");
  await page.locator('a[href="/grammar/a2?lesson=a2-two-way"]').click();
  await expect(page.getByRole("heading", { name: "Wechselpräpositionen", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Bắt đầu luyện bài", exact: true }).click();
  const input = page.getByRole("textbox", { name: "Đáp án ngữ pháp", exact: true });
  for (const value of ["dem", "den"]) {
    await input.fill(value); await page.getByRole("button", { name: "Kiểm tra đáp án", exact: true }).click();
    await page.getByRole("button", { name: "Câu tiếp theo →", exact: true }).click();
  }
  await page.getByRole("button", { name: "Wir laufen im Park.", exact: true }).click();
  await page.getByRole("button", { name: "Kiểm tra đáp án", exact: true }).click();
  await page.getByRole("button", { name: "Hoàn thành & lưu ngữ pháp", exact: true }).click();
  await expect(page.getByText("3/3 câu đúng lần đầu", { exact: true })).toBeVisible();
  await page.goBack(); await expect(page.getByRole("heading", { name: "Ngữ pháp A2", exact: true })).toBeVisible();
});

test("grammar pages, long titles and tables fit a 320px phone without client errors", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const path of ["/grammar", "/grammar/a1", "/grammar/a2", "/grammar/b1", "/grammar/b2", ...grammarLessons.map(l => `${grammarPath(l.level)}?lesson=${l.id}`)]) {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("grammar storage errors are visible and empty review filters have a way back", async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException("Blocked", "QuotaExceededError"); }; });
  await page.goto("/grammar/a1");
  await page.getByRole("checkbox", { name: "Chỉ bài có câu cần ôn", exact: true }).check();
  await expect(page.getByRole("heading", { name: "Chưa có bài phù hợp", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Xóa bộ lọc bài học", exact: true }).click();
  await page.locator('a[href="/grammar/a1?lesson=a1-pronouns"]').click();
  await page.getByRole("button", { name: "Đánh dấu đã đọc", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Không lưu được tiến độ ngữ pháp" })).toBeVisible();
  await expect(page.getByRole("button", { name: "✓ Đã đọc · Bỏ đánh dấu", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => localStorage.getItem("deutsch-quest-grammar-v1"))).toBeNull();
});

test("interactive clock explains quarters, half hours and reads the selected time", async ({ page }) => {
  await page.addInitScript(`
    window.__spoken = [];
    const synth = new EventTarget();
    synth.getVoices = () => [{lang: 'de-DE'}];
    synth.cancel = () => {};
    synth.speak = u => { window.__spoken.push(u.text); setTimeout(() => u.onend?.(), 10); };
    Object.defineProperty(window, 'speechSynthesis', {value: synth});
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {value: class {constructor(text) {this.text = text;}}});
  `);
  await page.goto("/grammar/a1?lesson=a1-time");
  const clock = page.getByRole("region", { name: "Thử một mốc giờ", exact: true });
  await clock.getByRole("combobox", { name: "Giờ (24h)", exact: true }).selectOption("14");
  const minutes = clock.getByRole("combobox", { name: "Phút", exact: true });
  await minutes.selectOption("30"); await expect(clock.getByText("halb drei", { exact: true })).toBeVisible();
  await minutes.selectOption("25"); await expect(clock.getByText("fünf vor halb drei", { exact: true })).toBeVisible();
  await minutes.selectOption("35"); await expect(clock.getByText("fünf nach halb drei", { exact: true })).toBeVisible();
  await minutes.selectOption("45"); await expect(clock.getByText("Viertel vor drei", { exact: true })).toBeVisible();
  await minutes.selectOption("15"); await expect(clock.getByText("Viertel nach zwei", { exact: true })).toBeVisible();
  await expect(clock.getByText("vierzehn Uhr fünfzehn", { exact: true })).toBeVisible();
  await clock.getByRole("button", { name: "Nghe cách thường ngày Es ist Viertel nach zwei.", exact: true }).click();
  await expect.poll(() => page.evaluate("window.__spoken.join('|')")).toBe("Es ist Viertel nach zwei.");
  await page.screenshot({ path: "test-results/grammar-clock-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/grammar-clock-mobile.png", fullPage: true });
});
