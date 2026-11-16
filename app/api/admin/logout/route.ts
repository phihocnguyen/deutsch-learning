import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookie, validAdminOrigin } from "@/lib/admin";
import { adminTokenHash } from "@/lib/admin-password";
import { neonPool } from "@/lib/neon";

export async function POST(request: Request) {
  if (!validAdminOrigin(request)) return Response.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  const token = (await cookies()).get(adminCookie)?.value;
  if (token) await neonPool().query("DELETE FROM admin_sessions WHERE token_hash=$1", [adminTokenHash(token)]);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookie, "", { path: "/", maxAge: 0, httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
  return response;
}
