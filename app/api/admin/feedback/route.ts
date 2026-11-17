import { adminSession } from "@/lib/admin";
import { neonPool } from "@/lib/neon";

export async function GET(request: Request) {
  if (!(await adminSession())) return Response.json({ error: "Bạn cần đăng nhập admin." }, { status: 403 });
  const rawPage = new URL(request.url).searchParams.get("page") ?? "1";
  if (!/^[1-9]\d{0,5}$/.test(rawPage)) return Response.json({ error: "Trang không hợp lệ." }, { status: 400 });
  const page = Number(rawPage);
  try {
    const [reports, count] = await Promise.all([
      neonPool().query(`SELECT f.id::text,f.category,f.message,f.page_path AS "pagePath",f.created_at AS "createdAt",
        u.name AS "userName",u.email AS "userEmail"
        FROM feedback_reports f LEFT JOIN users u ON u.id=f.user_id
        ORDER BY f.created_at DESC,f.id DESC LIMIT 25 OFFSET $1`, [(page - 1) * 25]),
      neonPool().query("SELECT count(*)::int AS total FROM feedback_reports"),
    ]);
    return Response.json({ reports: reports.rows, total: count.rows[0].total, page, pageSize: 25 }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return Response.json({ error: "Không tải được phản hồi." }, { status: 503 }); }
}
