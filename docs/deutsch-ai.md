The app proxies AI requests through authenticated `/api/deutsch-ai/*` routes to `https://vixoaidanloi.com/api/deutsch-ai/*`. Requests time out after 60 seconds and are not cached.

The upstream returned HTTP 401 for an unauthenticated sample request during integration. If the service uses Bearer authentication, set `DEUTSCH_AI_API_KEY` on the Next.js server. Never use a `NEXT_PUBLIC_` variable for this credential. Confirm the service's authentication scheme and response fields before production use.

Generate sends `{word, meaning_vi, level}`. The UI defaults to A1 and lets learners choose a level. Generated examples are displayed on request without replacing the saved example. The response adapter accepts `example_de`/`example_vi`, `sentence_de`/`sentence_vi`, or `example`/`translation` (also `german`/`vietnamese`) and requires both sentences. Update `lib/ai-results.ts` if the service uses another response schema.

Flashcard listening sends `{text}` to TTS and validates the returned WAV signature. Playback can be stopped; switching cards aborts pending requests and releases audio resources.

Run `npm run db:migrate` before deploying the pronunciation scoring feature. This adds the nullable `flashcards.ipa` column without replacing existing data. Enter the reference IPA (for example `/tyːɐ/`) when adding or editing a flashcard. Existing cards without IPA show instructions instead of enabling scoring. This integration does not invent IPA.

Recording requires HTTPS (or localhost), microphone permission and MediaRecorder. Recording stops after 15 seconds; uploads are limited to 5 MB. The browser sends its supported WebM/Opus, MP4 or Ogg recording. Verify these input formats with the scoring service. The server looks up `expected_ipa` by authenticated owner and card ID, and forwards multipart `audio` and `expected_ipa`. The score adapter expects `{score: number}` on a 0–100 scale; it rejects out-of-range values rather than inventing or rescaling scores. Reference IPA and recordings are not persisted by this app beyond the flashcard's IPA field.
