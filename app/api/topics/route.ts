import { auth } from "@/auth";
import { neonPool } from "@/lib/neon";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await neonPool().query(
    `SELECT t.id, t.name, count(f.id)::int AS "cardCount"
     FROM topics t LEFT JOIN flashcards f ON f.topic_id=t.id AND f.owner_id=t.owner_id
     WHERE t.owner_id=$1 GROUP BY t.id ORDER BY t.created_at DESC`, [Number(session.user.id)]);
  return NextResponse.json({ topics: result.rows }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.name !== "string" || !body.name.trim() || body.name.trim().length > 80)
    return NextResponse.json({ error: "Tên chủ đề cần từ 1 đến 80 ký tự." }, { status: 400 });
  const name = body.name.trim().normalize("NFC");
  const nameKey = name.toLocaleLowerCase("vi");
  try {
    const result = await neonPool().query(
      `INSERT INTO topics(owner_id,name,name_key) VALUES($1,$2,$3) RETURNING id,name,created_at`,
      [Number(session.user.id), name, nameKey]);
    return NextResponse.json({ topic: result.rows[0] }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505")
      return NextResponse.json({ error: "Bạn đã có chủ đề trùng tên." }, { status: 409 });
    throw error;
  }
}
