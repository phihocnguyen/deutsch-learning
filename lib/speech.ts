type VoiceSource = Pick<SpeechSynthesis, "getVoices" | "addEventListener" | "removeEventListener">;
export function waitForGermanVoice(source: VoiceSource, signal: AbortSignal, timeoutMs = 10000): Promise<SpeechSynthesisVoice | null> {
  const find = () => {
    const voices = source.getVoices();
    return voices.find(v => /^de[-_]DE$/i.test(v.lang)) ?? voices.find(v => /^de(?:[-_]|$)/i.test(v.lang)) ?? null;
  };
  if (signal.aborted) return Promise.resolve(null);
  const available = find();
  if (available) return Promise.resolve(available);
  return new Promise(resolve => {
    function finish(voice: SpeechSynthesisVoice | null) {
      clearInterval(poll); clearTimeout(timeout);
      source.removeEventListener("voiceschanged", check);
      signal.removeEventListener("abort", abort);
      resolve(voice);
    }
    function check() { const voice = find(); if (voice) finish(voice); }
    function abort() { finish(null); }
    const poll = setInterval(check, 200);
    const timeout = setTimeout(() => finish(null), timeoutMs);
    source.addEventListener("voiceschanged", check);
    signal.addEventListener("abort", abort, { once: true });
    check();
  });
}
