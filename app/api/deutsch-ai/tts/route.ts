import { auth } from "@/auth";
import { requestAI, aiError } from "@/lib/deutsch-ai";

export async function POST(request: Request) {
  if (!(await auth())?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.text !== "string" || !body.text.trim() || body.text.length > 1000)
    return Response.json({ error: "Nội dung cần từ 1 đến 1000 ký tự." }, { status: 400 });
  try {
    const response = await requestAI("tts", { text: body.text.trim() });
    const bytes = await response.arrayBuffer();
    const signature = new Uint8Array(bytes);
    if (bytes.byteLength < 12 || String.fromCharCode(...signature.slice(0, 4)) !== "RIFF" || String.fromCharCode(...signature.slice(8, 12)) !== "WAVE")
      throw new Error("Chưa tạo được âm thanh phù hợp.");
    return new Response(bytes, { headers: { "Content-Type": "audio/wav", "Cache-Control": "private, no-store" } });
  } catch (error) { return aiError(error); }
}
