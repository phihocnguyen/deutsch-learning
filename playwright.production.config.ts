import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({
  ...base,
  use: { ...base.use, baseURL: "http://localhost:3100" },
  // The npm script owns this server directly so shutdown also works on Windows.
  webServer: undefined,
});
