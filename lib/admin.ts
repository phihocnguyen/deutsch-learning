import { auth } from "@/auth";
import { isAdminEmail } from "./admin-policy";
import { cookies } from "next/headers";
import { neonPool } from "./neon";
import { adminTokenHash } from "./admin-password";

export const adminCookie = "deutsch-admin-session";

export async function adminSession() {
  const token = (await cookies()).get(adminCookie)?.value;
  if (token && /^[a-f0-9]{64}$/.test(token)) {
    const result = await neonPool().query(
      `SELECT a.id,a.username FROM admin_sessions s JOIN admin_accounts a ON a.id=s.admin_id
       WHERE s.token_hash=$1 AND s.expires>now()`, [adminTokenHash(token)]);
    if (result.rows[0]) return { user: { id: `admin:${result.rows[0].id}`, name: result.rows[0].username, email: null } };
  }
  const session = await auth();
  return session?.user?.id && isAdminEmail(session.user.email) ? session : null;
}

export function validAdminOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}
