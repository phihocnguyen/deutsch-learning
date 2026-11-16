"use client";
import Link from "next/link";
import { exerciseNames } from "@/lib/exercises";
import { useProgress } from "./progress-store";

export function ExerciseHistory() {
  const { progress, ready } = useProgress();
  const history = progress.exercises ?? [];
  const total = history.reduce((sum, result) => sum + result.total, 0);
  const correct = history.reduce((sum, result) => sum + result.correct, 0);
  return <section className="my-8 border-t-2 border-[#d8d9c9] pt-7" aria-labelledby="exercise-history-title"><div className="flex flex-wrap items-center justify-between gap-4"><h2 id="exercise-history-title" className="text-3xl">Kết quả bài tập</h2><Link href="/exercises" className="pixel-button bg-[#f9cd65]">Làm bài tập →</Link></div><p className="mt-4 text-sm text-[#647059]">Lưu tối đa 50 lượt gần nhất trên trình duyệt này. Lượt ôn và luyện mới được ghi riêng.</p>
    <div className="my-6 grid grid-cols-2 gap-4"><div className="border-2 border-[#29392a] bg-[#e0dff2] p-4"><p className="text-3xl">{ready ? history.length : "—"}</p><p className="text-sm">Lượt hoàn thành</p></div><div className="border-2 border-[#29392a] bg-[#dbe8cc] p-4"><p className="text-3xl">{ready ? `${correct}/${total}` : "—"}</p><p className="text-sm">Câu đúng lần đầu</p></div></div>
    {!ready ? <p>Đang tải kết quả…</p> : !history.length ? <p className="border-2 border-dashed border-[#c6c9b8] p-5 text-[#647059]">Chưa có lượt bài tập hoàn thành. Kết quả sẽ hiện ở đây sau lượt đầu tiên.</p> : <ol className="grid gap-4 md:grid-cols-2">{history.map(result => <li key={result.id} className="border-2 border-[#29392a] bg-[#fffdf5] p-5"><p className="eyebrow">{result.kind === "review" ? "ÔN TỪ SAI" : "LUYỆN MỚI"}</p><h3 className="mt-2 text-2xl">{exerciseNames[result.mode]}</h3><p className="my-2">{result.correct}/{result.total} câu đúng · {result.correct * 10} điểm</p><time className="text-sm text-[#647059]" dateTime={result.completedAt}>{new Date(result.completedAt).toLocaleString("vi-VN")}</time></li>)}</ol>}
  </section>;
}
