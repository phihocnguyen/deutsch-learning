import { auth } from "@/auth";
import { neonPool } from "@/lib/neon";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ topicId: string; flashcardId: string }> };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(_request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { topicId, flashcardId } = await params;
  if (!uuid.test(topicId) || !uuid.test(flashcardId)) return NextResponse.json({ error: "Flashcard không hợp lệ." }, { status: 400 });
  const result = await neonPool().query("DELETE FROM flashcards WHERE id=$1 AND topic_id=$2 AND owner_id=$3 RETURNING id", [flashcardId, topicId, Number(session.user.id)]);
  if (!result.rowCount) return NextResponse.json({ error: "Không tìm thấy flashcard." }, { status: 404 });
  return NextResponse.json({ deleted: true }, { headers: { "Cache-Control": "private, no-store" } });
}
