import { auth } from "@/auth";
import { neonPool } from "@/lib/neon";
import { aiError, requestAI } from "@/lib/deutsch-ai";
import { exercisePrompt, fallbackExerciseQuestions, parseQwenExercises } from "@/lib/ai-exercises";
import type { Word } from "@/lib/vocabulary";
import type { ExerciseMode } from "@/lib/exercises";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const ids = body?.wordIds;
  if (!Array.isArray(ids) || !ids.length || ids.length > 5 || new Set(ids).size !== ids.length || ids.some(id => typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) || !["gap", "article", "translate"].includes(body?.mode))
    return Response.json({ error: "Chọn từ 1 đến 5 từ và dạng bài hợp lệ." }, { status: 400 });
  try {
    const result = await neonPool().query(
      `SELECT f.id, t.name AS topic, f.german, f.vietnamese, f.article, f.plural, f.example, f.translation
       FROM flashcards f JOIN topics t ON t.id=f.topic_id AND t.owner_id=f.owner_id
       WHERE f.owner_id=$1 AND f.id=ANY($2::uuid[])`, [Number(session.user.id), ids]);
    const words = result.rows as Word[];
    if (words.length !== ids.length) return Response.json({ error: "Không tìm thấy từ vựng trong tài khoản của bạn. Hãy tải lại trang." }, { status: 404 });
    if (body.mode === "article" && words.some(word => !word.article)) return Response.json({ error: "Bài mạo từ cần các danh từ đã có der, die hoặc das." }, { status: 400 });
    const mode = body.mode as ExerciseMode;
    const headers = { "Cache-Control": "private, no-store" };
    if (mode !== "gap") return Response.json({ questions: fallbackExerciseQuestions(words, mode) }, { headers });
    if (!process.env.AI_SERVICE_TOKEN?.trim()) return Response.json({ error: "Máy chủ chưa cấu hình AI_SERVICE_TOKEN." }, { status: 503 });
    try {
      const response = await requestAI("qwen", exercisePrompt(words));
      const questions = parseQwenExercises(await response.text(), words, mode);
      return Response.json({ questions }, { headers });
    } catch (error) {
      if (error instanceof Error && error.message.includes("từ chối AI_SERVICE_TOKEN")) throw error;
      const questions = fallbackExerciseQuestions(words, mode);
      return Response.json({ questions, notice: "AI phản hồi chậm; bài tập dùng câu ví dụ đã lưu hoặc câu mẫu." }, { headers });
    }
  } catch (error) { return aiError(error); }
}
