import { test, expect } from "@playwright/test";
import { Pool } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";

try { process.loadEnvFile(".env.local"); } catch { /* CI may supply environment variables. */ }
test("admin login protects user management and supports account lifecycle", async ({ page, request, baseURL }) => {
  test.skip(!process.env.DATABASE_URL || !process.env.ADMIN_TEST_PASSWORD, "Needs a test database and admin credentials.");
  test.setTimeout(120000);
  expect((await request.get("/api/admin/users")).status()).toBe(403);
  expect((await request.post("/api/admin/login", { headers: { Origin: "https://untrusted.example" }, data: { username: "admin", password: "incorrect" } })).status()).toBe(403);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let userId: number | undefined;
  const email = `admin-test-${randomUUID()}@example.invalid`;
  try {
    const user = await pool.query("INSERT INTO users(name,email) VALUES($1,$2) RETURNING id", ["Admin lifecycle test", email]);
    userId = user.rows[0].id;
    const topic = await pool.query("INSERT INTO topics(owner_id,name,name_key) VALUES($1,'Test','test') RETURNING id", [userId]);
    await pool.query("INSERT INTO flashcards(owner_id,topic_id,german,vietnamese) VALUES($1,$2,'Test','Test')", [userId, topic.rows[0].id]);
    await pool.query('INSERT INTO sessions("userId","sessionToken",expires) VALUES($1,$2,now()+interval \'1 hour\')', [userId, randomUUID()]);
    await pool.query('INSERT INTO accounts("userId",type,provider,"providerAccountId") VALUES($1,\'oauth\',\'test\',$2)', [userId, randomUUID()]);

    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator("aside")).toHaveCount(0);
    await expect(page.locator("header")).toHaveCount(0);
    const loginBox = await page.locator("main > section").boundingBox();
    expect(loginBox).not.toBeNull();
    expect(Math.abs(loginBox!.y + loginBox!.height / 2 - page.viewportSize()!.height / 2)).toBeLessThan(3);
    expect(loginBox!.width).toBe(448);
    await page.getByLabel("Tên đăng nhập", { exact: true }).fill(process.env.ADMIN_TEST_USERNAME ?? "admin");
    await page.getByLabel("Mật khẩu", { exact: true }).fill(process.env.ADMIN_TEST_PASSWORD!);
    await page.getByRole("button", { name: "Đăng nhập admin", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Quản lý người dùng", exact: true })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Điều hướng quản trị" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Quản lý người dùng", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toHaveCount(0);
    // A hidden login page retained during navigation must not hide the active admin shell.
    await page.evaluate(() => { const cached = document.createElement("div"); cached.className = "login-page"; cached.hidden = true; cached.dataset.testid = "retained-login"; document.body.append(cached); });
    await expect(page.locator("aside")).toBeVisible();
    await expect(page.locator("header")).toBeVisible();
    await page.getByTestId("retained-login").evaluate(element => element.remove());
    await page.getByRole("searchbox").fill(email);
    await page.getByRole("button", { name: "Tìm kiếm", exact: true }).click();
    const card = page.locator("article").filter({ hasText: email });
    await expect(card).toBeVisible();
    await expect(card).toContainText("1 chủ đề · 1 thẻ · 1 phiên đăng nhập");
    await card.getByRole("button", { name: "Đổi tên", exact: true }).click();
    await page.getByLabel("Tên hiển thị").fill("Renamed admin test learner");
    await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
    await expect(card.getByRole("heading")).toHaveText("Renamed admin test learner");
    await card.getByRole("button", { name: "Khóa", exact: true }).click();
    await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
    await expect(card.getByRole("button", { name: "Mở khóa", exact: true })).toBeEnabled();
    expect((await pool.query("SELECT disabled FROM users WHERE id=$1", [userId])).rows[0].disabled).toBe(true);
    expect((await pool.query('SELECT count(*)::int AS count FROM sessions WHERE "userId"=$1', [userId])).rows[0].count).toBe(0);
    await card.getByRole("button", { name: "Mở khóa", exact: true }).click();
    await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
    await expect(card.getByRole("button", { name: "Khóa", exact: true })).toBeEnabled();
    expect((await pool.query("SELECT disabled FROM users WHERE id=$1", [userId])).rows[0].disabled).toBe(false);

    const contextRequest = page.context().request;
    expect((await contextRequest.patch(`/api/admin/users/${userId}`, { headers: { Origin: "https://untrusted.example" }, data: { action: "block" } })).status()).toBe(403);
    expect((await contextRequest.patch(`/api/admin/users/${userId}`, { headers: { Origin: baseURL! }, data: { action: "revoke-sessions" } })).ok()).toBe(true);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Mở menu quản trị", exact: true }).click();
    await expect(page.getByRole("navigation", { name: "Điều hướng quản trị" })).toBeVisible();
    await page.getByRole("button", { name: "Đóng menu quản trị", exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await card.getByRole("button", { name: "Xóa tài khoản", exact: true }).click();
    await expect(page.getByRole("button", { name: "Xác nhận", exact: true })).toBeDisabled();
    await page.getByRole("dialog").getByRole("textbox").fill(email);
    await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
    await expect(card).toHaveCount(0);
    expect((await pool.query("SELECT id FROM users WHERE id=$1", [userId])).rowCount).toBe(0);
    expect((await pool.query("SELECT id FROM topics WHERE owner_id=$1", [userId])).rowCount).toBe(0);
    expect((await pool.query('SELECT id FROM accounts WHERE "userId"=$1', [userId])).rowCount).toBe(0);
    await page.getByRole("button", { name: "Đăng xuất admin", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator("aside")).toHaveCount(0);
    await expect(page.locator("header")).toHaveCount(0);
    await expect(page.getByRole("navigation")).toHaveCount(0);
    const loggedOutBox = await page.locator("main > section").boundingBox();
    expect(loggedOutBox).not.toBeNull();
    expect(Math.abs(loggedOutBox!.y + loggedOutBox!.height / 2 - page.viewportSize()!.height / 2)).toBeLessThan(3);
    expect((await contextRequest.get("/api/admin/users")).status()).toBe(403);
  } finally {
    if (userId) {
      await pool.query('DELETE FROM sessions WHERE "userId"=$1', [userId]);
      await pool.query('DELETE FROM accounts WHERE "userId"=$1', [userId]);
      await pool.query("DELETE FROM users WHERE id=$1", [userId]);
    }
    await pool.end();
  }
});
