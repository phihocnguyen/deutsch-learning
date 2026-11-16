import { test, expect } from "@playwright/test";
import { createExerciseQuestions } from "../lib/exercises";
import { vocabulary, seedVocabulary } from "./fixtures/vocabulary";
test.beforeEach(async ({ page }) => { await seedVocabulary(page); });

test("gap retry preserves first score, saves progress once and reviews only the missed word", async ({ page }) => {
  const questions = createExerciseQuestions("gap", "Sinh hoạt", undefined, 25, vocabulary);
  await page.goto("/exercises");
  const topic = page.getByRole("combobox", { name: "Chủ đề", exact: true });
  await expect(topic).toBeEnabled(); await topic.selectOption("Sinh hoạt");
  await page.getByRole("button", { name: "Luyện điền từ vào câu →", exact: true }).click();
  let wrongId = "";
  for (let i = 0; i < 5; i++) {
    const prompt = await page.locator('section > p[lang="de"]').innerText();
    const question = questions.find(q => q.prompt === prompt)!;
    const input = page.getByRole("textbox", { name: "Đáp án tiếng Đức", exact: true });
    if (!i) {
      wrongId = question.word.id;
      await input.fill("sai"); await page.getByRole("button", { name: "Kiểm tra đáp án", exact: true }).click();
      await expect(page.getByText("↻ Chưa đúng, cùng xem lại nhé.", { exact: true })).toBeVisible();
      await expect(page.getByText(question.explanation, { exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Thử lại câu này", exact: true }).click();
    }
    await input.fill(`  ${question.answer.toLocaleUpperCase("de")}  `);
    await page.getByRole("button", { name: "Kiểm tra đáp án", exact: true }).click();
    await expect(page.getByRole("button", { name: "Kiểm tra đáp án", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: i === 4 ? "Hoàn thành & lưu kết quả" : "Câu tiếp theo →", exact: true }).click();
  }
  await expect(page.getByText("4/5 câu đúng lần đầu · 40 điểm", { exact: true })).toBeVisible();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("deutsch-quest-progress-v1")!));
  expect(stored.exercises).toHaveLength(1); expect(stored.words[wrongId]).toBe("review");
  await page.getByRole("button", { name: "Ôn 1 từ sai", exact: true }).click();
  await expect(page.getByText("Câu 1 / 1", { exact: true })).toBeVisible();
  const question = questions.find(q => q.word.id === wrongId)!;
  await page.getByRole("textbox", { name: "Đáp án tiếng Đức", exact: true }).fill(question.answer);
  await page.getByRole("button", { name: "Kiểm tra đáp án", exact: true }).click();
  await page.getByRole("button", { name: "Hoàn thành & lưu kết quả", exact: true }).click();
  await expect(page.getByText("1/1 câu đúng lần đầu · 10 điểm", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Xem tiến độ →", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Kết quả bài tập", exact: true })).toBeVisible();
  await expect(page.getByText("4/5 câu đúng · 40 điểm", { exact: true })).toBeVisible();
  await expect(page.getByText("1/1 câu đúng · 10 điểm", { exact: true })).toBeVisible();
  await page.reload(); await expect(page.getByText("4/5 câu đúng · 40 điểm", { exact: true })).toBeVisible();
  // Editing a word must preserve saved exercise history.
  await page.getByRole("button", { name: "Đã nhớ", exact: true }).first().click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("deutsch-quest-progress-v1")!).exercises.length)).toBe(2);
});

test("article exercises handle a topic without nouns and complete a noun round", async ({ page }) => {
  await page.goto("/exercises");
  const topic = page.getByRole("combobox", { name: "Chủ đề", exact: true });
  await expect(topic).toBeEnabled(); await topic.selectOption("Chào hỏi");
  await page.getByRole("button", { name: "Luyện chọn mạo từ →", exact: true }).click();
  await expect(page.getByText(/Bộ lọc này chưa có danh từ/)).toBeVisible();
  await topic.selectOption("Nhà cửa");
  await page.getByRole("button", { name: "Luyện chọn mạo từ →", exact: true }).click();
  for (let i = 0; i < 5; i++) {
    const prompt = await page.locator('section > p[lang="de"]').innerText();
    const word = vocabulary.find(w => `____ ${w.german}` === prompt)!;
    await page.getByRole("button", { name: word.article!, exact: true }).click();
    await page.getByRole("button", { name: "Kiểm tra đáp án", exact: true }).click();
    await page.getByRole("button", { name: i === 4 ? "Hoàn thành & lưu kết quả" : "Câu tiếp theo →", exact: true }).click();
  }
  await expect(page.getByText("5/5 câu đúng lần đầu · 50 điểm", { exact: true })).toBeVisible();
});

test("translation scores the learned word with its article and handles mobile layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/exercises");
  const topic = page.getByRole("combobox", { name: "Chủ đề", exact: true });
  await expect(topic).toBeEnabled(); await topic.selectOption("Nhà cửa");
  await page.getByRole("button", { name: "Luyện dịch việt – đức →", exact: true }).click();
  for (let i = 0; i < 5; i++) {
    const prompt = await page.locator('section > p[lang="vi"]').innerText();
    const word = vocabulary.find(w => w.vietnamese === prompt)!;
    await page.getByRole("textbox", { name: "Đáp án tiếng Đức", exact: true }).fill(`${word.article} ${word.german}`);
    await page.getByRole("button", { name: "Kiểm tra đáp án", exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: i === 4 ? "Hoàn thành & lưu kết quả" : "Câu tiếp theo →", exact: true }).click();
  }
  await expect(page.getByText("5/5 câu đúng lần đầu · 50 điểm", { exact: true })).toBeVisible();
});

test("blocked storage reports failure and preserves the completed result for this session", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException("Storage blocked", "QuotaExceededError"); };
  });
  await page.goto("/exercises");
  await page.getByRole("button", { name: "Luyện điền từ vào câu →", exact: true }).click();
  for (let i = 0; i < 5; i++) {
    await page.getByRole("button", { name: "Bỏ qua (0 điểm)", exact: true }).click();
    await page.getByRole("button", { name: i === 4 ? "Hoàn thành & lưu kết quả" : "Câu tiếp theo →", exact: true }).click();
  }
  await expect(page.getByRole("alert").filter({ hasText: "Không lưu được vào thiết bị" })).toBeVisible();
  await expect(page.getByText(/Kết quả đang được giữ trong phiên học này/)).toBeVisible();
  await page.getByRole("link", { name: "Xem tiến độ →", exact: true }).click();
  await expect(page.getByText("0/5 câu đúng · 0 điểm", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("deutsch-quest-progress-v1"))).toBeNull();
});
