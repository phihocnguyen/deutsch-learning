import { auth } from "@/auth";
import { neonPool } from "@/lib/neon";
import { requestAI, aiError } from "@/lib/deutsch-ai";
import { parseScore } from "@/lib/ai-results";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (Number(request.headers.get("content-length")) > 6 * 1024 * 1024) return Response.json({ error: "Bản ghi âm quá lớn." }, { status: 413 });
  const form = await request.formData().catch(() => null);
  const audio = form?.get("audio");
  const wordId = form?.get("wordId");
  if (!(audio instanceof File) || !audio.size || audio.size > 5 * 1024 * 1024 || !["audio/wav", "audio/x-wav", "audio/webm", "audio/ogg", "audio/mp4"].includes(audio.type.split(";")[0]) || typeof wordId !== "string" || !/^[0-9a-f-]{36}$/i.test(wordId))
    return Response.json({ error: "Bản ghi âm hoặc flashcard không hợp lệ (tối đa 5 MB)." }, { status: 400 });
  try {
    const result = await neonPool().query("SELECT ipa FROM flashcards WHERE id=$1 AND owner_id=$2", [wordId, Number(session.user.id)]);
    if (!result.rowCount) return Response.json({ error: "Không tìm thấy flashcard." }, { status: 404 });
    const ipa = result.rows[0].ipa;
    if (typeof ipa !== "string" || !ipa.trim()) return Response.json({ error: "Thẻ chưa có IPA. Hãy bổ sung IPA trong phần sửa flashcard." }, { status: 400 });
    const upstream = new FormData(); upstream.set("audio", audio); upstream.set("expected_ipa", ipa);
    const response = await requestAI("score", upstream);
    return Response.json({ score: parseScore(await response.json()) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return aiError(error); }
}
