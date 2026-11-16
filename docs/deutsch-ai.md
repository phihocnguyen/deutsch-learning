The app proxies AI requests through authenticated `/api/deutsch-ai/*` routes to `https://vixoaidanloi.com/api/deutsch-ai/*`. Requests time out after 60 seconds and are not cached.

The upstream returned HTTP 401 for an unauthenticated sample request during integration. If the service uses Bearer authentication, set `DEUTSCH_AI_API_KEY` on the Next.js server. Never use a `NEXT_PUBLIC_` variable for this credential. Confirm the service's authentication scheme and response fields before production use.

Generate sends `{word, meaning_vi, level}`. The UI defaults to A1 and lets learners choose a level. Generated examples are displayed on request without replacing the saved example. The response adapter accepts `example_de`/`example_vi`, `sentence_de`/`sentence_vi`, or `example`/`translation` (also `german`/`vietnamese`) and requires both sentences. Update `lib/ai-results.ts` if the service uses another response schema.
