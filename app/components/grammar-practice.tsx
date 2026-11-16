"use client";
import { useState } from "react";
import { gradeGrammarAnswer } from "@/lib/grammar";
import { latestGrammarAnswers } from "@/lib/grammar/progress";
import type { GrammarLesson, GrammarQuestion } from "@/lib/grammar/types";
import { recordAnswer, type Answers } from "@/lib/games";
import { useGrammarProgress } from "./grammar-store";

type Session = { id: string; kind: "practice" | "review"; questions: GrammarQuestion[] };
function GrammarRound({ lesson, session, restart }: { lesson: GrammarLesson; session: Session; restart: (questions: GrammarQuestion[], kind: Session["kind"]) => void }) {
  const { saveAttempt, ready, error } = useGrammarProgress();
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [complete, setComplete] = useState(false);
  const current = session.questions[index];
  const correct = Object.values(answers).filter(Boolean).length;
  const wrong = session.questions.filter(q => answers[q.id] === false);
  function submit(skip = false) {
    if (feedback !== null || (!skip && !input.trim())) return;
    const success = !skip && gradeGrammarAnswer(current, input);
    setAnswers(previous => recordAnswer(previous, current.id, success)); setFeedback(success);
  }
  function next() {
    if (feedback === null) return;
    if (index < session.questions.length - 1) { setIndex(value => value + 1); setInput(""); setFeedback(null); return; }
    if (!ready) return;
    saveAttempt({ id: session.id, lessonId: lesson.id, kind: session.kind, completedAt: new Date().toISOString(), answers });
    setComplete(true);
  }
  if (complete) return <div><h3 className="text-3xl">Kết quả luyện ngữ pháp</h3><p className="my-4 text-2xl">{correct}/{session.questions.length} câu đúng lần đầu</p><p className="text-sm text-[#59644f]">{error ? "Kết quả được giữ trong phiên hiện tại." : "Kết quả đã được lưu trên trình duyệt này."} Điểm luyện tập không phải chứng nhận trình độ.</p><ul className="my-6 space-y-3">{session.questions.map(q => <li className="border-b border-[#d8d9c9] pb-3" key={q.id}><p>{answers[q.id] ? "✓" : "↻"} {q.prompt}</p><p className="mt-2 text-sm">Đáp án chấp nhận: <span lang="de">{q.answers.join(" / ")}</span></p></li>)}</ul><div className="flex flex-wrap gap-4">{wrong.length > 0 && <button className="pixel-button bg-[#f8dda7]" onClick={() => restart(wrong, "review")}>Ôn {wrong.length} câu sai</button>}<button className="pixel-button bg-[#dbe8cc]" onClick={() => restart(lesson.questions, "practice")}>Luyện lại cả bài</button></div></div>;
  return <div><div className="mb-5 flex flex-wrap justify-between gap-3"><h3 className="text-2xl">{session.kind === "review" ? "Ôn câu sai" : "Luyện sau bài học"}</h3><span>Câu {index + 1} / {session.questions.length}</span></div><p className="mb-5 text-sm leading-6 text-[#59644f]">Chú ý chữ hoa, dấu ä/ö/ü/ß và dấu câu nếu đề yêu cầu viết cả câu. Khoảng trắng thừa được bỏ qua. Điểm tính ở lần trả lời đầu.</p><p className="mb-6 text-2xl" id={`grammar-question-${current.id}`}>{current.prompt}</p><form onSubmit={e => { e.preventDefault(); submit(); }}>
    {current.options ? <div className="mb-5 grid gap-4 sm:grid-cols-2">{current.options.map(option => <button key={option} type="button" disabled={feedback !== null} aria-pressed={input === option} className={`pixel-button justify-start text-left ${input === option ? "bg-[#f9cd65]" : "bg-[#fffdf5]"}`} onClick={() => setInput(option)}>{option}</button>)}</div> : <label className="block">Đáp án ngữ pháp<input className="my-3 block w-full border-2 border-[#29392a] bg-[#fffdf5] p-3" aria-describedby={`grammar-question-${current.id}`} lang="de" autoComplete="off" spellCheck={false} disabled={feedback !== null} value={input} onChange={e => setInput(e.target.value)} /></label>}
    <button className="pixel-button bg-[#f9cd65]" disabled={feedback !== null || !input.trim()}>Kiểm tra đáp án</button></form>
    <div role="status" className="mt-6 min-h-16">{feedback !== null && <div className={`border-2 border-[#29392a] p-5 ${feedback ? "bg-[#dbe8cc]" : "bg-[#f8dda7]"}`}><p>{feedback ? "✓ Chính xác!" : "↻ Cần xem lại."}</p><p className="my-3">Đáp án chấp nhận: <strong lang="de">{current.answers.join(" / ")}</strong></p><p className="text-sm leading-7">{current.explanation}</p></div>}</div>
    <div className="mt-5 flex flex-wrap gap-4">{feedback !== null ? <><button className="pixel-button bg-[#dbe8cc]" disabled={!ready} onClick={next}>{index === session.questions.length - 1 ? "Hoàn thành & lưu ngữ pháp" : "Câu tiếp theo →"}</button>{!feedback && <button className="pixel-button bg-[#fffdf5]" onClick={() => { setInput(""); setFeedback(null); }}>Thử lại để hiểu bài</button>}</> : <button className="text-sm underline" onClick={() => submit(true)}>Bỏ qua câu (0 điểm)</button>}</div>
    {Object.hasOwn(answers, current.id) && feedback === null && <p className="mt-4 text-sm text-[#59644f]">Lần thử lại không thay đổi điểm của lần trả lời đầu.</p>}
  </div>;
}

export function GrammarPractice({ lesson }: { lesson: GrammarLesson }) {
  const { progress, ready } = useGrammarProgress();
  const [session, setSession] = useState<Session | null>(null);
  const latest = latestGrammarAnswers(progress, lesson.id);
  const wrong = lesson.questions.filter(q => latest[q.id] === false);
  function start(questions: GrammarQuestion[], kind: Session["kind"]) { setSession({ id: crypto.randomUUID(), kind, questions }); }
  return <section className="pixel-panel my-8 bg-[#f5f3e8] p-5 sm:p-8" aria-label="Bài luyện ngữ pháp">{session ? <GrammarRound key={session.id} lesson={lesson} session={session} restart={start} /> : <><h2 className="text-3xl">Đến lượt bạn</h2><p className="my-4 text-[#59644f]">{lesson.questions.length} câu luyện quy tắc vừa học. Xem giải thích sau mỗi câu, rồi lưu kết quả khi hoàn thành.</p><div className="flex flex-wrap gap-4"><button className="pixel-button bg-[#f9cd65]" disabled={!ready} onClick={() => start(lesson.questions, "practice")}>Bắt đầu luyện bài</button>{wrong.length > 0 && <button className="pixel-button bg-[#fffdf5]" disabled={!ready} onClick={() => start(wrong, "review")}>Ôn {wrong.length} câu sai gần nhất</button>}</div><p className="mt-5 text-sm text-[#59644f]">Lượt đang làm chưa được lưu giữa chừng. Đọc bài và kết quả luyện được theo dõi riêng.</p></>}</section>;
}
