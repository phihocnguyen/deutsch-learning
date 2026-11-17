"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "./progress-store";
import { useCustomVocabulary } from "./custom-vocabulary-store";
import { useGrammarProgress } from "./grammar-store";

const dayLabel = new Intl.DateTimeFormat("vi-VN", { weekday: "short" });
const dateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export function ProgressInsights() {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setToday(new Date()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const { progress, ready: progressReady, error: progressError } = useProgress();
  const custom = useCustomVocabulary();
  const grammar = useGrammarProgress();
  const ready = progressReady && custom.ready && grammar.ready;
  const known = custom.data.words.filter(word => progress.words[word.id] === "known").length;
  const review = custom.data.words.filter(word => progress.words[word.id] === "review").length;
  const exercises = progress.exercises ?? [];
  const grammarAttempts = grammar.progress.attempts;
  const exerciseTotal = exercises.reduce((sum, item) => sum + item.total, 0);
  const exerciseCorrect = exercises.reduce((sum, item) => sum + item.correct, 0);
  const grammarTotal = grammarAttempts.reduce((sum, item) => sum + Object.keys(item.answers).length, 0);
  const grammarCorrect = grammarAttempts.reduce((sum, item) => sum + Object.values(item.answers).filter(Boolean).length, 0);
  const totalAnswers = exerciseTotal + grammarTotal;
  const correctAnswers = exerciseCorrect + grammarCorrect;
  const accuracy = totalAnswers ? Math.round(correctAnswers / totalAnswers * 100) : 0;
  const week = today ? Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = dateKey(date);
    const sessions = [...exercises.filter(item => dateKey(new Date(item.completedAt)) === key), ...grammarAttempts.filter(item => dateKey(new Date(item.completedAt)) === key)].length;
    return { date, sessions };
  }) : [];
  const maxSessions = Math.max(1, ...week.map(day => day.sessions));
  const recentGrammarAccuracy = grammarTotal ? Math.round(grammarCorrect / grammarTotal * 100) : null;

  return <>
    <p className="eyebrow">NHÌN LẠI · TIẾN ĐỘ HỌC</p>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-4"><h1 className="text-4xl">Tiến độ của bạn</h1><Link className="pixel-button bg-[#f9cd65]" href="/exercises">Tiếp tục luyện →</Link></div>
    <p className="mt-4 max-w-3xl leading-7 text-[#647059]">Nhìn lại nhịp học, độ chính xác và những phần nên ôn tiếp theo.</p>
    {(custom.error || progressError || grammar.error) && <p role="alert" className="my-5 border-2 border-[#b56e3e] bg-[#fff0d5] p-4 text-sm">{custom.error || progressError || grammar.error}</p>}
    <div className="my-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="pixel-panel bg-[#dbe8cc] p-5"><p className="text-sm">Chủ đề đang học</p><p className="mt-3 text-4xl">{ready ? custom.data.topics.length : "—"}</p><p className="mt-2 text-sm">{ready ? `${custom.data.words.length} flashcard` : "Đang tải dữ liệu"}</p></div>
      <div className="pixel-panel bg-[#f8dda7] p-5"><p className="text-sm">Câu trả lời đúng</p><p className="mt-3 text-4xl">{ready && totalAnswers ? `${accuracy}%` : ready ? "—" : "—"}</p><p className="mt-2 text-sm">{totalAnswers ? `${correctAnswers}/${totalAnswers} câu` : "Chưa có lượt luyện"}</p></div>
      <div className="pixel-panel bg-[#e0dff2] p-5"><p className="text-sm">Từ đã nhớ</p><p className="mt-3 text-4xl">{ready ? known : "—"}</p><p className="mt-2 text-sm">trên {ready ? custom.data.words.length : "—"} flashcard</p></div>
      <div className="pixel-panel bg-[#f3d9ce] p-5"><p className="text-sm">Từ cần ôn</p><p className="mt-3 text-4xl">{ready ? review : "—"}</p><p className="mt-2 text-sm">{review ? "Ưu tiên trong lượt học tới" : "Chưa có từ cần ôn"}</p></div>
    </div>

    <section className="pixel-panel mb-7 bg-[#fffdf5] p-6 sm:p-8" aria-labelledby="weekly-insights-title">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">7 NGÀY GẦN NHẤT</p><h2 id="weekly-insights-title" className="mt-2 text-3xl">Nhịp học của bạn</h2></div><p className="text-sm text-[#647059]">Số lượt bài tập và ngữ pháp hoàn thành</p></div>
      <div className="mt-8 grid h-52 grid-cols-7 items-end gap-3 sm:gap-5" role="img" aria-label="Biểu đồ số lượt học mỗi ngày trong bảy ngày gần nhất">
        {week.map(({ date, sessions }) => <div key={dateKey(date)} className="flex h-full flex-col items-center justify-end gap-2"><span className="text-xs text-[#52604a]">{sessions || ""}</span><div className="flex h-36 w-full items-end border-b-2 border-[#29392a] bg-[#f5f3e8]"><div className="w-full border-t-2 border-[#29392a] bg-[#8ea474] transition-[height]" style={{ height: `${sessions ? Math.max(12, sessions / maxSessions * 100) : 0}%` }} /></div><span className="text-xs capitalize text-[#647059]">{dayLabel.format(date)}</span></div>)}
      </div>
      {!totalAnswers && <p className="mt-5 border-l-4 border-[#d5b256] pl-4 text-sm text-[#647059]">Hoàn thành một bài tập hoặc bài ngữ pháp để bắt đầu thấy nhịp học của bạn ở đây.</p>}
    </section>

    <section className="grid gap-6 lg:grid-cols-2">
      <article className="pixel-panel bg-[#edf2e4] p-6"><p className="eyebrow">GỢI Ý TIẾP THEO</p><h2 className="mt-3 text-2xl">{review ? `Ôn lại ${review} từ đang cần nhớ` : !custom.data.words.length ? "Tạo bộ flashcard đầu tiên" : "Duy trì nhịp học"}</h2><p className="my-4 text-sm leading-6 text-[#52604a]">{review ? "Bắt đầu bằng các từ đã đánh dấu cần ôn, sau đó thử một trò chơi để củng cố." : !custom.data.words.length ? "Tạo chủ đề và thêm từ để theo dõi trạng thái ghi nhớ." : "Một lượt luyện ngắn giúp bạn theo dõi độ chính xác theo thời gian."}</p><Link className="pixel-button bg-[#fffdf5]" href={review ? "/exercises" : "/flashcards"}>{review ? "Đi đến bài tập →" : "Mở flashcard →"}</Link></article>
      <article className="pixel-panel bg-[#fffdf5] p-6"><p className="eyebrow">NGỮ PHÁP A1–B2</p><h2 className="mt-3 text-2xl">{grammar.progress.readLessons.length} bài đã đọc</h2><p className="my-3 text-sm text-[#52604a]">{grammarAttempts.length} lượt luyện · {recentGrammarAccuracy === null ? "Chưa có kết quả" : `${recentGrammarAccuracy}% câu đúng`}</p><div className="mb-5 h-3 border-2 border-[#29392a] bg-[#f5f3e8]" role="progressbar" aria-label="Tỉ lệ câu ngữ pháp trả lời đúng" aria-valuemin={0} aria-valuemax={100} aria-valuenow={recentGrammarAccuracy ?? 0}><div className="h-full bg-[#7e9863]" style={{ width: `${recentGrammarAccuracy ?? 0}%` }} /></div><Link className="pixel-button bg-[#dbe8cc]" href="/grammar">Tiếp tục ngữ pháp →</Link></article>
    </section>
    <p className="mt-7 text-xs leading-6 text-[#647059]">Biểu đồ và kết quả được tổng hợp từ hoạt động đã lưu trên trình duyệt này.</p>
  </>;
}
