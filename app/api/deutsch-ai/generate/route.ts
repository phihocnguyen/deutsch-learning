import { auth } from "@/auth";
import { requestAI, aiError } from "@/lib/deutsch-ai";
import { parseExample } from "@/lib/ai-results";

export async function POST(request: Request) {
  if (!(await auth())?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.word !== "string" || !body.word.trim() || body.word.length > 170 || typeof body?.meaning_vi !== "string" || !body.meaning_vi.trim() || body.meaning_vi.length > 300 || !["A1", "A2", "B1", "B2", "C1", "C2"].includes(body.level))
    return Response.json({ error: "Từ, nghĩa hoặc trình độ không hợp lệ." }, { status: 400 });
  try {
    const response = await requestAI("generate", { word: body.word, meaning_vi: body.meaning_vi, level: body.level });
    return Response.json(parseExample(await response.json()), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return aiError(error); }
}
