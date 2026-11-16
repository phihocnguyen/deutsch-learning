import test from "node:test";
import assert from "node:assert/strict";
import { waitForGermanVoice } from "../lib/speech.ts";
class VoiceSource extends EventTarget {
  voices = [];
  getVoices() { return this.voices; }
}
test("waits for asynchronously loaded German voices instead of failing immediately", async () => {
  const source = new VoiceSource();
  let resolved = false;
  const promise = waitForGermanVoice(source, new AbortController().signal, 1000).then(v => { resolved = true; return v; });
  await Promise.resolve(); assert.equal(resolved, false);
  source.voices = [{ lang: "en-US" }, { lang: "de-DE" }];
  source.dispatchEvent(new Event("voiceschanged"));
  assert.equal((await promise).lang, "de-DE");
});
test("prefers Germany voice, never substitutes a non-German voice", async () => {
  const source = new VoiceSource();
  source.voices = [{ lang: "de-AT" }, { lang: "de-DE" }];
  assert.equal((await waitForGermanVoice(source, new AbortController().signal)).lang, "de-DE");
  source.voices = [{ lang: "en-US" }];
  assert.equal(await waitForGermanVoice(source, new AbortController().signal, 5), null);
});
test("cancels pending voice loading when stopped or the card changes", async () => {
  const source = new VoiceSource();
  const controller = new AbortController();
  const promise = waitForGermanVoice(source, controller.signal);
  controller.abort(); assert.equal(await promise, null);
});
