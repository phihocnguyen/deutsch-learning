import { auth } from "@/auth";
import { requestAI, aiError } from "@/lib/deutsch-ai";
import { parseExample } from "@/lib/ai-results";

export async function POST(request: Request) {
  if (!(await auth())?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.word !== "string" || !body.word.trim() || body.word.length > 170 || typeof body?.meaning_vi !== "string" || !body.meaning_vi.trim() || body.meaning_vi.length > 300)
    return Response.json({ error: "Từ hoặc nghĩa không hợp lệ." }, { status: 400 });
  try {
    const response = await requestAI("generate", { word: body.word, meaning_vi: body.meaning_vi, level: "A1" });
    return Response.json(parseExample(await response.text()), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return aiError(error); }
}
