"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { checkExerciseAnswer, exerciseNames, type ExerciseMode, type ExerciseQuestion } from "@/lib/exercises";
import { fullWord } from "@/lib/vocabulary";
import { useCustomVocabulary } from "./custom-vocabulary-store";
import { EmptyVocabulary } from "./empty-vocabulary";
import { recordAnswer, shuffle, type Answers } from "@/lib/games";
import type { ExerciseResult } from "@/lib/progress";
import { useProgress } from "./progress-store";
import { Pronunciation } from "./pronunciation";

type Session = { id: string; mode: ExerciseMode; kind: "practice" | "review"; questions: ExerciseQuestion[]; notice?: string };
const modes: { mode: ExerciseMode; icon: string; detail: string; color: string }[] = [
  { mode: "gap", icon: "_", detail: "Chọn đúng từ và dạng chia để hoàn thành một câu tiếng Đức.", color: "bg-[#dbe8cc]" },
  { mode: "article", icon: "D", detail: "Nhớ giống danh từ qua ba mạo từ der, die, das.", color: "bg-[#f8dda7]" },
  { mode: "translate", icon: "⇄", detail: "Nhớ lại từ tiếng Đức từ nghĩa Việt, kèm mạo từ nếu là danh từ.", color: "bg-[#e0dff2]" },
];

function ExerciseRound({ session, leave, replay, review }: { session: Session; leave: () => void; replay: () => void; review: (ids: string[]) => void }) {
  const { saveExerciseResult, error, ready } = useProgress();
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [complete, setComplete] = useState(false);
  const question = session.questions[index];
  const wrong = session.questions.filter(q => answers[q.word.id] === false);
  const correct = session.questions.filter(q => answers[q.word.id] === true).length;

  function submit(skip = false) {
    if (feedback !== null || (!skip && !input.trim())) return;
    const success = !skip && checkExerciseAnswer(input, question);
    setAnswers(previous => recordAnswer(previous, question.word.id, success));
    setFeedback(success);
  }
  function next() {
    if (feedback === null) return;
    if (index < session.questions.length - 1) { setIndex(i => i + 1); setInput(""); setFeedback(null); return; }
    if (!ready) return;
    const result: ExerciseResult = { id: session.id, mode: session.mode, kind: session.kind, completedAt: new Date().toISOString(), total: session.questions.length, correct, wrongIds: wrong.map(q => q.word.id) };
    saveExerciseResult(result); setComplete(true);
  }

  if (complete) return <section className="pixel-panel bg-[#fffdf5] p-6 sm:p-9"><p className="eyebrow">{session.kind === "review" ? "KẾT QUẢ LƯỢT ÔN" : "KẾT QUẢ BÀI TẬP"}</p><h2 className="mt-4 text-4xl">Hoàn thành rồi! ✦</h2><p className="mt-5 text-3xl">{correct}/{session.questions.length} câu đúng lần đầu · {correct * 10} điểm</p><p className="my-5 text-sm text-[#647059]">{error ? "Kết quả đang được giữ trong phiên học này." : "Kết quả đã được ghi nhận trên thiết bị."} {wrong.length ? `${wrong.length} từ sai đã được đánh dấu cần ôn. Lượt thử lại được tính riêng.` : "Bạn đã trả lời đúng tất cả các câu trong lượt này."}</p>
    {error && <p role="alert" className="my-4 border-2 border-[#b56e3e] bg-[#fff0d5] p-4 text-sm">{error}</p>}
    <ul className="my-6 space-y-4">{session.questions.map(q => <li key={q.word.id} className="border-b border-[#d8d9c9] pb-3"><span>{answers[q.word.id] ? "✓" : "↻"}</span> <span lang="de">{fullWord(q.word)}</span> — {q.word.vietnamese}<p className="mt-2 text-sm text-[#647059]">Đáp án: <span lang="de">{q.answer}</span></p></li>)}</ul>
    <div className="flex flex-wrap gap-4">{wrong.length > 0 && <button className="pixel-button bg-[#f8dda7]" onClick={() => review(wrong.map(q => q.word.id))}>Ôn {wrong.length} từ sai</button>}<button className="pixel-button bg-[#dbe8cc]" onClick={replay}>Làm lượt mới</button><button className="pixel-button bg-[#fffdf5]" onClick={leave}>Chọn bài tập khác</button><Link className="pixel-button bg-[#f9cd65]" href="/progress">Xem tiến độ →</Link></div></section>;

  return <section className="pixel-panel bg-[#fffdf5] p-6 sm:p-9">{session.notice && <p role="status" className="mb-5 border-2 border-[#d8d9c9] bg-[#edf2e4] p-3 text-sm">{session.notice}</p>}<div className="flex flex-wrap justify-between gap-3"><span className="pixel-label">{question.word.topic}</span><span>Câu {index + 1} / {session.questions.length}</span></div>
    <div className="my-6 h-3 border-2 border-[#29392a] bg-[#faf8ef]" role="progressbar" aria-label="Tiến độ bài tập" aria-valuemin={0} aria-valuemax={session.questions.length} aria-valuenow={index + Number(feedback !== null)}><div className="h-full bg-[#7e9863] transition-all" style={{ width: `${(index + Number(feedback !== null)) / session.questions.length * 100}%` }} /></div>
    <h2 className="text-3xl">{session.mode === "gap" ? "Điền từ còn thiếu" : session.mode === "article" ? "Mạo từ nào đi cùng danh từ này?" : "Viết từ tiếng Đức đã học"}</h2><p lang={session.mode === "translate" ? "vi" : "de"} className="my-6 break-words text-3xl">{session.mode === "article" ? `____ ${question.prompt}` : question.prompt}</p>
    {session.mode === "gap" && <p className="mb-5 text-[#647059]">{question.word.translation}</p>}
    <p className="mb-5 text-sm text-[#647059]">{session.mode === "translate" ? "Dùng từ trong bộ từ đã học. Danh từ cần có mạo từ số ít." : session.mode === "gap" ? "Điền đúng dạng của từ theo câu, không chỉ dạng nguyên mẫu." : "Chọn mạo từ ở dạng Nominativ số ít."} Không phân biệt hoa/thường; giữ đúng dấu tiếng Đức.</p>
    <form onSubmit={event => { event.preventDefault(); submit(); }}>
      {session.mode === "article" ? <div className="mb-6 flex flex-wrap gap-4">{["der", "die", "das"].map(article => <button type="button" key={article} disabled={feedback !== null} aria-pressed={input === article} className={`pixel-button min-w-20 ${input === article ? "bg-[#f9cd65]" : "bg-[#f5f3e8]"}`} onClick={() => setInput(article)}>{article}</button>)}</div> : <><label className="block">Đáp án tiếng Đức<input lang="de" autoComplete="off" spellCheck={false} className="my-3 block w-full border-2 border-[#29392a] bg-[#faf8ef] p-3" value={input} disabled={feedback !== null} onChange={e => setInput(e.target.value)} /></label><div className="my-4 flex flex-wrap gap-3" aria-label="Ký tự tiếng Đức">{["ä", "ö", "ü", "ß"].map(letter => <button type="button" key={letter} className="pixel-button bg-[#f5f3e8]" disabled={feedback !== null} aria-label={`Thêm ${letter}`} onClick={() => setInput(value => value + letter)}>{letter}</button>)}</div></>}
      <button className="pixel-button bg-[#f9cd65]" disabled={feedback !== null || !input.trim()}>Kiểm tra đáp án</button>
    </form>
    <div className="mt-6 min-h-20" role="status">{feedback !== null && <div className={`border-2 border-[#29392a] p-5 ${feedback ? "bg-[#e1e9d4]" : "bg-[#f8dda7]"}`}><p className="text-2xl">{feedback ? "✓ Chính xác!" : "↻ Chưa đúng, cùng xem lại nhé."}</p><p className="my-3">Đáp án: <strong lang="de">{question.answer}</strong></p><p className="text-sm leading-7">{question.explanation}</p><div className="mt-4"><Pronunciation key={`${question.word.id}-${index}`} id={`exercise-${question.word.id}`} text={session.mode === "gap" ? question.word.example : fullWord(question.word)} label="Nghe đáp án" /></div></div>}</div>
    <div className="mt-6 flex flex-wrap gap-4">{feedback !== null ? <><button className="pixel-button bg-[#dbe8cc]" disabled={!ready} onClick={next}>{index === session.questions.length - 1 ? "Hoàn thành & lưu kết quả" : "Câu tiếp theo →"}</button>{!feedback && <button className="pixel-button bg-[#fffdf5]" onClick={() => { setInput(""); setFeedback(null); }}>Thử lại câu này</button>}</> : <button className="text-sm underline" onClick={() => submit(true)}>Bỏ qua (0 điểm)</button>}</div>
    {Object.hasOwn(answers, question.word.id) && feedback === null && <p className="mt-4 text-sm text-[#647059]">Đây là lần thử lại. Điểm của câu này giữ theo lần trả lời đầu.</p>}
  </section>;
}

export function ExerciseHub() {
  const { ready: progressReady } = useProgress();
  const custom = useCustomVocabulary();
  const ready = progressReady && custom.ready;
  const [session, setSession] = useState<Session | null>(null);
  const [choosingMode, setChoosingMode] = useState<ExerciseMode | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef<AbortController | null>(null);
  const topics = custom.data.topics.map(topic => ({ ...topic, cardCount: custom.data.words.filter(word => word.topicId === topic.id).length }));

  useEffect(() => {
    const current = dialog.current;
    if (!current) return;
    if (choosingMode && !current.open) current.showModal();
    if (!choosingMode && current.open) current.close();
  }, [choosingMode]);
  useEffect(() => () => pending.current?.abort(), []);

  function closeDialog() {
    pending.current?.abort(); pending.current = null;
    setGenerating(false); setChoosingMode(null); setError("");
  }

  async function generate(mode: ExerciseMode, topicId: string) {
    const pool = custom.data.words.filter(word => word.topicId === topicId && (mode !== "article" || word.article));
    if (!pool.length) { setError(mode === "article" ? "Chủ đề này chưa có danh từ với mạo từ der, die hoặc das." : "Chủ đề này chưa có từ phù hợp."); return; }
    const controller = new AbortController();
    pending.current = controller;
    setGenerating(true); setError("");
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/deutsch-ai/exercises", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ wordIds: shuffle(pool).slice(0, 5).map(word => word.id), mode }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(data?.questions) || !data.questions.length)
        throw new Error(data?.error || "Không tạo được bài tập. Hãy thử lại.");
      if (controller.signal.aborted) return;
      setSession({ id: crypto.randomUUID(), mode, kind: "practice", questions: data.questions, notice: data.notice });
      setChoosingMode(null);
    } catch (cause) {
      if (pending.current === controller) setError(controller.signal.aborted ? "Tạo bài tập quá lâu. Hãy thử lại." : cause instanceof Error ? cause.message : "Không tạo được bài tập. Hãy thử lại.");
    } finally {
      clearTimeout(timeout);
      if (pending.current === controller) { pending.current = null; setGenerating(false); }
    }
  }
  return <><p className="eyebrow">LUYỆN TỪ TRONG NGỮ CẢNH</p><div className="mt-4 flex flex-wrap justify-between gap-4"><h1 className="text-4xl">{session ? exerciseNames[session.mode] : "Bài tập"}</h1>{session && <button className="pixel-button bg-[#fffdf5]" onClick={() => setSession(null)}>← Chọn bài khác</button>}</div><p className="my-5 text-[#647059]">Tối đa 5 câu mỗi lượt. Điểm tính theo lần trả lời đầu; từ sai được tự đánh dấu cần ôn khi hoàn thành.</p>
    {custom.error && <p role="alert" className="my-5 bg-[#fff0d5] p-4">{custom.error}</p>}
    {custom.ready && !custom.data.words.length && <EmptyVocabulary />}
    {session ? <ExerciseRound key={session.id} session={session} leave={() => setSession(null)} replay={() => { setChoosingMode(session.mode); setSession(null); }} review={ids => setSession({ ...session, id: crypto.randomUUID(), kind: "review", questions: session.questions.filter(question => ids.includes(question.word.id)) })} /> : <><div className="grid gap-6 xl:grid-cols-3">{modes.map(item => <article key={item.mode} className={`pixel-panel p-6 ${item.color}`}><span className="pixel-icon bg-[#fffdf5]" aria-hidden="true">{item.icon}</span><h2 className="mt-6 text-3xl">{exerciseNames[item.mode]}</h2><p className="mt-3 min-h-28 text-[#52604a]">{item.detail}</p><button className="pixel-button mt-5 bg-[#fffdf5]" disabled={!ready} onClick={() => { setChoosingMode(item.mode); setError(""); }}>Luyện {exerciseNames[item.mode].toLocaleLowerCase("vi")} →</button></article>)}</div><p className="mt-7 text-sm text-[#647059]">Bài đang làm chưa được lưu giữa chừng. Hãy hoàn thành lượt để ghi nhận kết quả trên thiết bị.</p></>}
    {choosingMode && <dialog ref={dialog} aria-labelledby="exercise-topic-title" className="flashcard-dialog topic-dialog pixel-panel bg-[#f5f3e8] p-6 sm:p-8" onCancel={event => { event.preventDefault(); closeDialog(); }}><div className="flex items-center justify-between gap-4"><h2 id="exercise-topic-title" className="text-2xl font-bold">Chọn chủ đề</h2><button type="button" className="pixel-button bg-[#fffdf5]" onClick={closeDialog}>Đóng</button></div><p className="mt-3 text-sm text-[#647059]">Chọn chủ đề để luyện {exerciseNames[choosingMode].toLocaleLowerCase("vi")}.</p>{generating ? <p className="mt-6 flex items-center gap-3" role="status"><span className="inline-block h-5 w-5 animate-spin border-2 border-[#29392a] border-t-transparent" aria-hidden="true" />Đang tạo bài tập…</p> : error ? <p className="mt-5 text-[#b42318]" role="alert">{error}</p> : topics.length ? <div className="mt-5 grid gap-3">{topics.map(topic => <button type="button" key={topic.id} disabled={!topic.cardCount} className="pixel-button justify-between bg-[#fffdf5] disabled:cursor-not-allowed disabled:opacity-60" onClick={() => void generate(choosingMode, topic.id)}><span>{topic.name}</span><span className={topic.cardCount ? "pixel-label" : "text-sm text-[#b42318]"}>{topic.cardCount ? `${topic.cardCount} thẻ` : "Chủ đề chưa có từ"}</span></button>)}</div> : <p className="mt-5 text-[#647059]">Bạn chưa tạo chủ đề nào.</p>}{error && <button type="button" className="pixel-button mt-4 bg-[#dbe8cc]" onClick={() => setError("")}>Chọn chủ đề khác</button>}</dialog>}
  </>;
}
