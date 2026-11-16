import { test, expect, type Page } from "@playwright/test";

async function createTopic(page: Page, name: string) {
  await page.getByRole("button", { name: "＋ Tạo chủ đề", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Từ tiếng Đức *", exact: true })).toHaveCount(0);
  await page.getByRole("textbox", { name: "Tên chủ đề", exact: true }).fill(name);
  await page.getByRole("button", { name: "Tạo chủ đề", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
}
function topicLink(page: Page, name: string) {
  return page.getByRole("link").filter({ has: page.getByRole("heading", { name, exact: true }) });
}
const manage = (page: Page) => page.getByRole("button", { name: "＋ Thêm / quản lý flashcard", exact: true });

test("topics are a separate page; opening a topic authors, studies and edits only its cards", async ({ page }) => {
  await page.goto("/flashcards");
  await expect(page.locator("button.flip-card")).toHaveCount(0);
  await createTopic(page, "Du lịch");
  await expect(topicLink(page, "Du lịch")).toContainText("0 THẺ");
  await createTopic(page, "Công việc");
  await topicLink(page, "Du lịch").click();
  await expect(page).toHaveURL(/\/flashcards\/study\?topic=/);
  await expect(page.getByRole("heading", { name: "Du lịch", level: 1, exact: true })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Chủ đề", exact: true })).toHaveCount(0);
  await manage(page).click();
  await expect(page.getByRole("textbox", { name: "Tên chủ đề", exact: true })).toHaveCount(0);
  await page.getByRole("textbox", { name: "Từ tiếng Đức *", exact: true }).fill("der Bahnhof");
  await page.getByRole("textbox", { name: "Nghĩa tiếng Việt *", exact: true }).fill("Nhà ga");
  await page.getByRole("textbox", { name: "Số nhiều", exact: true }).fill("die Bahnhöfe");
  await page.getByRole("textbox", { name: "Câu ví dụ tiếng Đức", exact: true }).fill("Der Bahnhof ist groß.");
  await page.getByRole("textbox", { name: "Bản dịch câu ví dụ", exact: true }).fill("Nhà ga lớn.");
  await page.getByRole("button", { name: "Thêm flashcard", exact: true }).click();
  await page.getByRole("button", { name: "Đóng popup", exact: true }).click();
  const card = page.locator("button.flip-card");
  await expect(card).toContainText("der Bahnhof");
  await expect(card).toContainText("die Bahnhöfe");
  await expect(card).not.toContainText("der der");
  await card.click();
  await expect(card).toContainText("Der Bahnhof ist groß.");
  await page.getByRole("button", { name: "✓ Đã nhớ", exact: true }).click();
  await page.reload();
  await expect(card).toContainText("Đã nhớ");
  await manage(page).click();
  await page.getByRole("button", { name: "Sửa der Bahnhof", exact: true }).click();
  await page.getByRole("textbox", { name: "Nghĩa tiếng Việt *", exact: true }).fill("Ga tàu");
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(page.getByRole("dialog").getByText("Ga tàu", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "← Các chủ đề", exact: true }).click();
  await expect(topicLink(page, "Du lịch")).toContainText("1/1 từ đã nhớ");
  await topicLink(page, "Công việc").click();
  await expect(page.getByRole("heading", { name: "Công việc", level: 1, exact: true })).toBeVisible();
  await expect(card).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL(/\/flashcards$/);
  await topicLink(page, "Du lịch").click();
  await manage(page).click();
  await page.getByRole("button", { name: "Xóa chủ đề", exact: true }).click();
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sửa der Bahnhof", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Xóa chủ đề", exact: true }).click();
  await page.getByRole("button", { name: "Xác nhận xóa", exact: true }).click();
  await expect(page).toHaveURL(/\/flashcards$/);
  await page.reload();
  await expect(topicLink(page, "Du lịch")).toHaveCount(0);
  await expect(topicLink(page, "Công việc")).toBeVisible();
});

test("fresh browsers have no presets and invalid topic links have a way back", async ({ page }) => {
  for (const route of ["/vocabulary", "/games", "/exercises"]) {
    await page.goto(route);
    const select = page.getByRole("combobox", { name: "Chủ đề", exact: true });
    await expect(select).toBeEnabled();
    await expect(select.locator("option")).toHaveCount(1);
  }
  await page.goto("/flashcards");
  await expect(page.getByRole("heading", { name: "Bộ từ đầu tiên bắt đầu từ đây", exact: true })).toBeVisible();
  await page.goto("/flashcards/study?topic=missing");
  await expect(page.getByRole("heading", { name: "Không tìm thấy chủ đề", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "← Danh sách chủ đề", exact: true }).click();
  await expect(page).toHaveURL(/\/flashcards$/);
});

test("topic creation and study fit a small phone and blocked storage is explicit", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException("Denied", "SecurityError"); };
  });
  await page.goto("/flashcards");
  await createTopic(page, "Công việc");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("phiên hiện tại");
  await topicLink(page, "Công việc").click();
  await manage(page).click();
  await page.getByRole("textbox", { name: "Từ tiếng Đức *", exact: true }).fill("arbeiten");
  await page.getByRole("textbox", { name: "Nghĩa tiếng Việt *", exact: true }).fill("Làm việc");
  await page.getByRole("button", { name: "Thêm flashcard", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Xóa arbeiten", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
