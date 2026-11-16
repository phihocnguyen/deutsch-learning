import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { neonPool } from "@/lib/neon";
import { adminCookie, validAdminOrigin } from "@/lib/admin";
import { adminTokenHash, verifyAdminPassword } from "@/lib/admin-password";

export async function POST(request: Request) {
  if (!validAdminOrigin(request)) return Response.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (typeof body?.username !== "string" || body.username.length > 80 || typeof body?.password !== "string" || !body.password || body.password.length > 1024)
    return Response.json({ error: "Tên đăng nhập hoặc mật khẩu không đúng." }, { status: 400 });
  const client = await neonPool().connect();
  try {
    await client.query("BEGIN");
    const result = await client.query("SELECT * FROM admin_accounts WHERE username=$1 FOR UPDATE", [body.username.trim().toLowerCase()]);
    const account = result.rows[0];
    const locked = account?.locked_until && new Date(account.locked_until).getTime() > Date.now();
    if (!account || locked || !await verifyAdminPassword(body.password, account.password_hash)) {
      if (account && !locked) await client.query(
        `UPDATE admin_accounts SET failed_attempts=CASE WHEN locked_until IS NOT NULL AND locked_until<=now() THEN 1 ELSE failed_attempts+1 END,
         locked_until=CASE WHEN (CASE WHEN locked_until IS NOT NULL AND locked_until<=now() THEN 1 ELSE failed_attempts+1 END)>=5 THEN now()+interval '15 minutes' ELSE NULL END WHERE id=$1`, [account.id]);
      await client.query("COMMIT");
      return Response.json({ error: "Không đăng nhập được. Kiểm tra tài khoản và mật khẩu; nếu thử sai nhiều lần, hãy chờ 15 phút." }, { status: 401 });
    }
    const token = randomBytes(32).toString("hex");
    await client.query("UPDATE admin_accounts SET failed_attempts=0,locked_until=NULL WHERE id=$1", [account.id]);
    await client.query("DELETE FROM admin_sessions WHERE expires<=now()");
    await client.query("INSERT INTO admin_sessions(token_hash,admin_id,expires) VALUES($1,$2,now()+interval '8 hours')", [adminTokenHash(token), account.id]);
    await client.query("COMMIT");
    const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(adminCookie, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 8 * 60 * 60 });
    return response;
  } catch { await client.query("ROLLBACK"); return Response.json({ error: "Không kết nối được hệ thống admin. Hãy thử lại." }, { status: 503 }); }
  finally { client.release(); }
}
