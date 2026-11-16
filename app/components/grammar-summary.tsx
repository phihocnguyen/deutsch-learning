"use client";
import Link from "next/link";
import { grammarLessons } from "@/lib/grammar";
import { useGrammarProgress } from "./grammar-store";
export function GrammarSummary() {
  const { progress, ready, error } = useGrammarProgress();
  return <section className="my-8 border-t-2 border-[#d8d9c9] pt-7" aria-labelledby="grammar-progress-title"><h2 id="grammar-progress-title" className="mb-5 text-3xl">Tiến độ ngữ pháp</h2>{error && <p role="alert" className="my-4 text-sm text-[#80421e]">{error}</p>}<div className="grid gap-5 sm:grid-cols-2">{(["A1", "A2"] as const).map(level => { const lessons = grammarLessons.filter(l => l.level === level); const read = lessons.filter(l => progress.readLessons.includes(l.id)).length; const practiced = lessons.filter(l => progress.attempts.some(a => a.lessonId === l.id)).length; return <Link key={level} href={`/grammar/${level.toLowerCase()}`} className="pixel-panel bg-[#edf2e4] p-5"><h3 className="text-3xl">Ngữ pháp {level}</h3><p className="mt-3">Đã đọc: {ready ? read : "—"}/{lessons.length}</p><p className="mt-2">Có lượt luyện: {ready ? practiced : "—"}/{lessons.length}</p><span className="mt-4 block text-sm">Tiếp tục học →</span></Link>; })}</div><p className="mt-5 text-sm text-[#59644f]">Lưu riêng tiến độ đọc và 50 lượt luyện ngữ pháp gần nhất. Kết quả không phải chứng nhận trình độ.</p></section>;
}
