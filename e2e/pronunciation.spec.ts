import { expect, test } from "@playwright/test";

test("records a learner's voice, sends the card ID and audio, then shows the score", async ({ page, context }) => {
  const topicId = "11111111-1111-4111-8111-111111111111";
  const wordId = "22222222-2222-4222-8222-222222222222";
  await context.addCookies([{ name: "authjs.session-token", value: "test-session", domain: "localhost", path: "/" }]);
  await page.route("**/api/topics", route => route.fulfill({ json: { topics: [{ id: topicId, name: "Từ luyện âm" }] } }));
  await page.route(`**/api/topics/${topicId}/flashcards`, route => route.fulfill({ json: { flashcards: [{
    id: wordId, topicId, topic: "Từ luyện âm", german: "Tür", vietnamese: "cửa",
    article: "die", example: "Die Tür ist offen.", translation: "Cửa đang mở.", ipa: "/tyːɐ/",
  }] } }));
  let upload = "";
  await page.route("**/api/deutsch-ai/score", route => {
    upload = route.request().postDataBuffer()?.toString("latin1") ?? "";
    return route.fulfill({ json: { score: 87.5 } });
  });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: {
      getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }),
    } });
    class FakeRecorder {
      static isTypeSupported() { return true; }
      state = "inactive";
      mimeType = "audio/webm;codecs=opus";
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      onerror: (() => void) | null = null;
      start() { this.state = "recording"; }
      stop() {
        this.state = "inactive";
        this.ondataavailable?.({ data: new Blob(["audio sample"], { type: this.mimeType }) });
        this.onstop?.();
      }
    }
    Object.defineProperty(window, "MediaRecorder", { configurable: true, value: FakeRecorder });
    class FakeAudio {
      src: string;
      constructor(src: string) { this.src = src; }
      play() { document.body.dataset.recordingPlayed = this.src; return Promise.resolve(); }
      pause() {}
    }
    Object.defineProperty(window, "Audio", { configurable: true, value: FakeAudio });
  });

  await page.goto(`/flashcards/study?topic=${topicId}`);
  await expect(page.getByRole("button", { name: "Kiểm tra phát âm" })).toBeVisible();
  await page.getByRole("button", { name: "Kiểm tra phát âm" }).click();
  await expect(page.getByRole("dialog", { name: "Kiểm tra phát âm" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ghi âm phát âm" })).toBeEnabled();
  await page.getByRole("button", { name: "Ghi âm phát âm" }).click();
  await expect(page.getByRole("button", { name: "Dừng và chấm điểm" })).toBeVisible();
  await page.getByRole("button", { name: "Dừng và chấm điểm" }).click();
  await expect(page.getByRole("progressbar", { name: "Điểm phát âm" })).toHaveAttribute("aria-valuenow", "87.5");
  await expect(page.getByRole("progressbar", { name: "Điểm phát âm" })).toHaveCSS("background-image", /conic-gradient.*87\.5%/);
  await page.getByRole("button", { name: "Nghe lại bản ghi âm" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-recording-played", /^blob:/);
  expect(upload).toContain(wordId);
  expect(upload).toContain("audio sample");
  await page.getByRole("button", { name: "Đóng" }).click();
  await expect(page.getByRole("dialog", { name: "Kiểm tra phát âm" })).toHaveCount(0);
});
