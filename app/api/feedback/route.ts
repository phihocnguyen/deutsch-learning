import { auth } from "@/auth";
import { neonPool } from "@/lib/neon";
import { parseFeedbackInput } from "@/lib/feedback";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Hãy đăng nhập để gửi góp ý." }, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  const raw = await request.text();
  if (raw.length > 10000) return Response.json({ error: "Nội dung quá dài." }, { status: 413 });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 }); }
  const input = parseFeedbackInput(body);
  if (!input) return Response.json({ error: "Chọn loại phản hồi và nhập nội dung từ 10 đến 2000 ký tự." }, { status: 400 });
  try {
    const userId = Number(session.user.id);
    const recent = await neonPool().query("SELECT count(*)::int AS total FROM feedback_reports WHERE user_id=$1 AND created_at>now()-interval '1 day'", [userId]);
    if (recent.rows[0].total >= 5) return Response.json({ error: "Bạn đã gửi 5 phản hồi trong 24 giờ. Hãy thử lại sau." }, { status: 429 });
    await neonPool().query("INSERT INTO feedback_reports(user_id,category,message,page_path) VALUES($1,$2,$3,$4)", [userId, input.category, input.message, input.pagePath]);
    return Response.json({ ok: true }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch { return Response.json({ error: "Chưa gửi được phản hồi. Hãy thử lại sau." }, { status: 503 }); }
}
