import test from "node:test";
import assert from "node:assert/strict";
import { parseFeedbackInput } from "../lib/feedback.ts";

test("feedback accepts bounded messages and local page paths", () => {
  assert.deepEqual(parseFeedbackInput({ category: "bug", message: "  Không mở được bài học  ", pagePath: "/grammar/b1" }), { category: "bug", message: "Không mở được bài học", pagePath: "/grammar/b1" });
  for (const value of [
    { category: "other", message: "Một lời nhắn đủ dài", pagePath: "/" },
    { category: "feedback", message: "ngắn", pagePath: "/" },
    { category: "feedback", message: "x".repeat(2001), pagePath: "/" },
    { category: "feedback", message: "Một lời nhắn đủ dài", pagePath: "//other.example" },
    { category: "feedback", message: "Một lời nhắn đủ dài", pagePath: "/\\other.example" },
  ]) assert.equal(parseFeedbackInput(value), null);
});
