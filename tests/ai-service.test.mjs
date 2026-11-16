import test from "node:test";
import assert from "node:assert/strict";
import { aiError, requestAI } from "../lib/deutsch-ai.ts";

test("AI requests require AI_SERVICE_TOKEN and send it as a Bearer token", async () => {
  const oldToken = process.env.AI_SERVICE_TOKEN;
  const oldFetch = globalThis.fetch;
  try {
    delete process.env.AI_SERVICE_TOKEN;
    globalThis.fetch = () => { throw new Error("fetch must not run without a token"); };
    await assert.rejects(requestAI("generate", { word: "Haus" }), /AI_SERVICE_TOKEN/);
    assert.equal(aiError(new Error("Máy chủ chưa cấu hình AI_SERVICE_TOKEN.")).status, 503);

    process.env.AI_SERVICE_TOKEN = " test-token ";
    globalThis.fetch = async (_url, options) => {
      assert.equal(options.headers.Authorization, "Bearer test-token");
      return new Response("{}", { status: 200 });
    };
    assert.equal((await requestAI("generate", { word: "Haus" })).status, 200);

    globalThis.fetch = async () => new Response("", { status: 401 });
    await assert.rejects(requestAI("generate", { word: "Haus" }), /từ chối AI_SERVICE_TOKEN/);
  } finally {
    if (oldToken === undefined) delete process.env.AI_SERVICE_TOKEN;
    else process.env.AI_SERVICE_TOKEN = oldToken;
    globalThis.fetch = oldFetch;
  }
});
