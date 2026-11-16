import { auth } from "@/auth";
import { neonPool } from "@/lib/neon";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ topicId: string }> };
const topicIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { topicId } = await params;
  if (!topicIdPattern.test(topicId)) return NextResponse.json({ error: "Chủ đề không hợp lệ." }, { status: 400 });
  const result = await neonPool().query(
    `SELECT f.id, f.topic_id AS "topicId", t.name AS topic, f.german, f.vietnamese,
            f.article, f.plural, f.example, f.translation, p.status
     FROM flashcards f JOIN topics t ON t.id=f.topic_id AND t.owner_id=f.owner_id
     LEFT JOIN flashcard_progress p ON p.flashcard_id=f.id AND p.owner_id=f.owner_id
     WHERE f.owner_id=$1 AND f.topic_id=$2 ORDER BY f.created_at,f.id`,
    [Number(session.user.id), topicId]);
  return NextResponse.json({ flashcards: result.rows }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { topicId } = await params;
  if (!topicIdPattern.test(topicId)) return NextResponse.json({ error: "Chủ đề không hợp lệ." }, { status: 400 });
  const body = await request.json().catch(() => null);
  const fields = [body?.german, body?.vietnamese];
  if (!fields.every(value => typeof value === "string" && value.trim()) || body.german.length > 160 || body.vietnamese.length > 300)
    return NextResponse.json({ error: "Từ tiếng Đức và nghĩa tiếng Việt là bắt buộc." }, { status: 400 });
  if (body.article != null && !["der", "die", "das"].includes(body.article)) return NextResponse.json({ error: "Mạo từ không hợp lệ." }, { status: 400 });
  for (const field of ["plural", "example", "translation"]) if (body[field] != null && (typeof body[field] !== "string" || body[field].length > (field === "example" || field === "translation" ? 1000 : 160))) return NextResponse.json({ error: `Trường ${field} quá dài hoặc không hợp lệ.` }, { status: 400 });
  const result = await neonPool().query(
    `INSERT INTO flashcards(owner_id,topic_id,german,vietnamese,article,plural,example,translation)
     SELECT $1,t.id,$3,$4,$5,$6,$7,$8 FROM topics t WHERE t.id=$2 AND t.owner_id=$1
     RETURNING id,topic_id AS "topicId",german,vietnamese,article,plural,example,translation`,
    [Number(session.user.id), topicId, body.german.trim().normalize("NFC"), body.vietnamese.trim(), body.article ?? null, body.plural?.trim() || null, body.example?.trim() ?? "", body.translation?.trim() ?? ""]);
  if (!result.rowCount) return NextResponse.json({ error: "Không tìm thấy chủ đề." }, { status: 404 });
  return NextResponse.json({ flashcard: result.rows[0] }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
