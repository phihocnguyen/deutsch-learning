import { adminSession } from "@/lib/admin";
import { isAdminEmail } from "@/lib/admin-policy";
import { neonPool } from "@/lib/neon";

export async function GET(request: Request) {
  const session = await adminSession();
  if (!session) return Response.json({ error: "Bạn cần đăng nhập admin." }, { status: 403 });
  const params = new URL(request.url).searchParams;
  const search = (params.get("q") ?? "").trim().slice(0, 255);
  const page = Math.min(100000, Math.max(1, Number(params.get("page")) || 1));
  const status = params.get("status") ?? "all";
  if (!Number.isInteger(page) || !["all", "active", "blocked"].includes(status)) return Response.json({ error: "Bộ lọc không hợp lệ." }, { status: 400 });
  const values = [search, status];
  const where = `WHERE ($1='' OR strpos(lower(coalesce(u.name,'')),lower($1))>0 OR strpos(lower(coalesce(u.email,'')),lower($1))>0)
    AND ($2='all' OR ($2='blocked' AND u.disabled) OR ($2='active' AND NOT u.disabled))`;
  try {
    const [users, count, stats] = await Promise.all([
      neonPool().query(`SELECT u.id::text,u.name,u.email,u.disabled,
        (SELECT count(*)::int FROM topics WHERE owner_id=u.id) AS "topicCount",
        (SELECT count(*)::int FROM flashcards WHERE owner_id=u.id) AS "cardCount",
        (SELECT count(*)::int FROM sessions WHERE "userId"=u.id AND expires>now()) AS "sessionCount"
        FROM users u ${where} ORDER BY u.id DESC LIMIT 25 OFFSET $3`, [...values, (page - 1) * 25]),
      neonPool().query(`SELECT count(*)::int AS total FROM users u ${where}`, values),
      neonPool().query(`SELECT count(*)::int AS total,count(*) FILTER(WHERE NOT disabled)::int AS active,count(*) FILTER(WHERE disabled)::int AS blocked FROM users`),
    ]);
    return Response.json({ users: users.rows.map(user => ({ ...user, isAdmin: isAdminEmail(user.email) })), total: count.rows[0].total, stats: stats.rows[0], page, pageSize: 25, currentUserId: session.user.id }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return Response.json({ error: "Không tải được danh sách người dùng." }, { status: 503 }); }
}
