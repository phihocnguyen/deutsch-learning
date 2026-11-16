"use client";
import Link from "next/link";
import { useState } from "react";
import { fullWord, topics, type Word } from "@/lib/vocabulary";
import { createDeck, isSpellingCorrect, letterTiles, makeChoices, recordAnswer, shuffle, type Answers, type GameMode } from "@/lib/games";
import { Pronunciation } from "./pronunciation";
import { useProgress } from "./progress-store";

const games: { mode: GameMode; icon: string; title: string; detail: string; color: string }[] = [
  { mode: "match", icon: "⇄", title: "Nối từ", detail: "Ghép từ Đức với nghĩa tiếng Việt. Đúng ngay lần đầu để nhận điểm.", color: "bg-[#dbe8cc]" },
  { mode: "meaning", icon: "?", title: "Chọn nghĩa", detail: "Một từ tiếng Đức, bốn lựa chọn. Bạn nhớ được bao nhiêu?", color: "bg-[#f8dda7]" },
  { mode: "listen", icon: "♪", title: "Nghe đoán từ", detail: "Lắng nghe giọng Đức rồi tìm đúng từ. Có thể nghe lại nhiều lần.", color: "bg-[#e0dff2]" },
  { mode: "letters", icon: "A", title: "Sắp xếp chữ", detail: "Ghép những ký tự nhỏ thành từ hoàn chỉnh, giữ đúng dấu tiếng Đức.", color: "bg-[#f3d9ce]" },
];
type Session = { mode: GameMode; words: Word[]; key: number };

function Results({ words, answers, replay, leave }: { words: Word[]; answers: Answers; replay: () => void; leave: () => void }) {
  const correct = words.filter(w => answers[w.id]).length;
  const wrong = words.filter(w => !answers[w.id]);
  const { setStatus, ready, error } = useProgress();
  const [saved, setSaved] = useState(false);
  return <section className="pixel-panel bg-[#fffdf5] p-6 sm:p-9"><p className="eyebrow">HOÀN THÀNH LƯỢT CHƠI</p><h2 className="mt-4 text-4xl">Thêm một bước tiến! ✦</h2><p className="my-6 text-3xl">{correct * 10} điểm · {correct}/{words.length} từ đúng lần đầu</p><p className="text-[#647059]">Điểm của lượt chơi này. Không có phạt thời gian.</p>
    <ul className="my-6 space-y-3">{words.map(w => <li key={w.id} className="border-b border-[#d8d9c9] pb-3"><span aria-label={answers[w.id] ? "Đúng" : "Cần ôn"}>{answers[w.id] ? "✓" : "↻"}</span> <span lang="de">{fullWord(w)}</span> — {w.vietnamese}</li>)}</ul>
    {wrong.length > 0 && <button className="pixel-button mb-5 bg-[#f8dda7]" disabled={!ready || saved} onClick={() => { for (const w of wrong) setStatus(w.id, "review"); setSaved(true); }}>{saved ? "Đã đánh dấu cần ôn" : `Đánh dấu ${wrong.length} từ cần ôn`}</button>}
    {error && <p role="alert" className="mb-5 text-sm text-[#80421e]">{error}</p>}
    <div className="flex flex-wrap gap-4"><button className="pixel-button bg-[#f9cd65]" onClick={replay}>↻ Chơi lượt mới</button><button className="pixel-button bg-[#fffdf5]" onClick={leave}>Chọn game khác</button><Link className="pixel-button bg-[#dbe8cc]" href="/flashcards">Ôn flashcard →</Link></div></section>;
}

function MatchingGame({ words, replay, leave }: { words: Word[]; replay: () => void; leave: () => void }) {
  const [right] = useState(() => shuffle(words));
  const [selected, setSelected] = useState("");
  const [matched, setMatched] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [message, setMessage] = useState("Chọn một từ bên trái rồi chọn nghĩa bên phải.");
  function pair(id: string) {
    if (!selected || matched.includes(id)) return;
    if (selected === id) {
      setAnswers(a => recordAnswer(a, id, !mistakes.includes(id)));
      setMatched(m => m.includes(id) ? m : [...m, id]); setSelected(""); setMessage("✓ Chính xác! Tiếp tục với cặp tiếp theo.");
    } else { setMistakes(m => m.includes(selected) ? m : [...m, selected]); setMessage("Chưa khớp. Hãy thử một nghĩa khác cho từ đang chọn."); }
  }
  if (matched.length === words.length) return <Results words={words} answers={answers} replay={replay} leave={leave} />;
  return <section className="pixel-panel bg-[#fffdf5] p-5 sm:p-8"><div className="mb-6 flex justify-between"><h2 className="text-3xl">Nối từ Đức – Việt</h2><span>{matched.length}/{words.length} cặp</span></div><p role="status" className="mb-6 min-h-12 text-[#647059]">{message}</p>
    <div className="grid grid-cols-2 gap-4 sm:gap-7"><div className="space-y-4">{words.map(w => <button key={w.id} lang="de" className={`pixel-button min-h-20 w-full break-words ${selected === w.id ? "bg-[#f9cd65]" : "bg-[#e1e9d4]"}`} aria-pressed={selected === w.id} disabled={matched.includes(w.id)} onClick={() => { setSelected(w.id); setMessage("Chọn nghĩa tiếng Việt tương ứng ở bên phải."); }}>{matched.includes(w.id) ? "✓ " : ""}{fullWord(w)}</button>)}</div>
    <div className="space-y-4">{right.map(w => <button key={w.id} className="pixel-button min-h-20 w-full bg-[#f8dda7]" disabled={!selected || matched.includes(w.id)} onClick={() => pair(w.id)}>{matched.includes(w.id) ? "✓ " : ""}{w.vietnamese}</button>)}</div></div>
  </section>;
}

function QuizGame({ session, replay, leave }: { session: Session; replay: () => void; leave: () => void }) {
  const { words, mode } = session;
  const [rounds] = useState(() => words.map(word => ({ word, choices: makeChoices(word, words), tiles: letterTiles(word) })));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [selected, setSelected] = useState("");
  const [typed, setTyped] = useState("");
  const [used, setUsed] = useState<number[]>([]);
  if (index >= rounds.length) return <Results words={words} answers={answers} replay={replay} leave={leave} />;
  const { word, choices, tiles } = rounds[index];
  const answered = Object.hasOwn(answers, word.id);
  function submit(skip = false) {
    if (answered || (!skip && !(mode === "letters" ? typed.trim() : selected))) return;
    const correct = !skip && (mode === "letters" ? isSpellingCorrect(typed, word) : selected === word.id);
    setAnswers(a => recordAnswer(a, word.id, correct));
  }
  function next() { setIndex(i => i + 1); setSelected(""); setTyped(""); setUsed([]); }
  return <section className="pixel-panel bg-[#fffdf5] p-6 sm:p-9"><div className="mb-7 flex flex-wrap justify-between gap-3"><span className="pixel-label">{word.topic}</span><span>Câu {index + 1} / {rounds.length}</span></div>
    <div className="mb-5 h-3 border-2 border-[#29392a] bg-[#f5f3e8]" role="progressbar" aria-label="Số câu hoàn thành" aria-valuemin={0} aria-valuemax={rounds.length} aria-valuenow={index + Number(answered)}><div className="h-full bg-[#7e9863] transition-all" style={{ width: `${(index + Number(answered)) / rounds.length * 100}%` }} /></div>
    <h2 className="mb-6 text-3xl">{mode === "listen" ? "Bạn vừa nghe từ nào?" : mode === "letters" ? `Ghép từ có nghĩa: ${word.vietnamese}` : "Từ này có nghĩa là gì?"}</h2>
    {mode === "meaning" && <p lang="de" className="mb-7 text-4xl">{fullWord(word)}</p>}
    {mode === "listen" && <div className="mb-6"><Pronunciation key={word.id} id={`game-${word.id}`} text={fullWord(word)} label="Nghe câu hỏi" /></div>}
    {mode === "letters" ? <form onSubmit={e => { e.preventDefault(); submit(); }}><p className="mb-4 text-sm text-[#647059]">Bấm các chữ hoặc gõ bàn phím. Chỉ ghép từ, không kèm mạo từ. Giữ đúng ä, ö, ü, ß.</p>
      <div className="mb-5 flex flex-wrap gap-3" aria-label="Các ký tự">{tiles.map((letter, i) => <button key={i} type="button" className="pixel-button min-w-12 bg-[#f8dda7]" disabled={answered || used.includes(i)} aria-label={letter === " " ? "Dấu cách" : `Chữ ${letter}`} onClick={() => { setTyped(t => t + letter); setUsed(u => [...u, i]); }}>{letter === " " ? "␣" : letter}</button>)}</div>
      <label className="block">Từ tiếng Đức<input className="my-3 block w-full border-2 border-[#29392a] bg-[#faf8ef] p-3" autoComplete="off" spellCheck={false} lang="de" value={typed} disabled={answered} onChange={e => { setTyped(e.target.value); setUsed([]); }} /></label><div className="flex flex-wrap gap-4"><button type="button" className="pixel-button bg-[#fffdf5]" disabled={answered || !typed} onClick={() => { setTyped(""); setUsed([]); }}>Xóa chữ</button><button className="pixel-button bg-[#f9cd65]" disabled={answered || !typed.trim()}>Kiểm tra</button></div></form>
      : <><div className="grid gap-4 sm:grid-cols-2">{choices.map(choice => <button key={choice.id} className={`pixel-button justify-start text-left ${answered && choice.id === word.id ? "bg-[#dbe8cc]" : answered && choice.id === selected ? "bg-[#f3d9ce]" : selected === choice.id ? "bg-[#f9cd65]" : "bg-[#f5f3e8]"}`} aria-pressed={selected === choice.id} disabled={answered} onClick={() => setSelected(choice.id)}>{answered && choice.id === word.id ? "✓ " : ""}{mode === "listen" ? fullWord(choice) : choice.vietnamese}</button>)}</div><button className="pixel-button mt-6 bg-[#f9cd65]" disabled={answered || !selected} onClick={() => submit()}>Xác nhận đáp án</button></>}
    <div className="mt-6 min-h-14" role="status">{answered && <><p className={answers[word.id] ? "text-[#3e642d]" : "text-[#80421e]"}>{answers[word.id] ? "✓ Chính xác!" : "↻ Cần ôn thêm."} <span lang="de">{fullWord(word)}</span> — {word.vietnamese}</p><p className="mt-2 text-sm text-[#647059]" lang="de">{word.example}</p></>}</div>
    {answered ? <button className="pixel-button mt-4 bg-[#dbe8cc]" onClick={next}>{index === rounds.length - 1 ? "Xem kết quả →" : "Câu tiếp theo →"}</button> : <button className="mt-4 text-sm underline" onClick={() => submit(true)}>Bỏ qua câu này (0 điểm)</button>}
  </section>;
}

export function GameHub() {
  const [topic, setTopic] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [message, setMessage] = useState("");
  function start(mode: GameMode) {
    const words = createDeck(topic);
    if (!words.length) { setMessage("Chủ đề chưa có từ. Hãy chọn chủ đề khác."); return; }
    setMessage(""); setSession(previous => ({ mode, words, key: (previous?.key ?? 0) + 1 }));
  }
  const current = games.find(g => g.mode === session?.mode);
  return <><p className="eyebrow">CHƠI MỘT CHÚT · NHỚ THÊM MỘT CHÚT</p><div className="mt-4 flex flex-wrap items-center justify-between gap-4"><h1 className="text-4xl">{current?.title ?? "Khu trò chơi"}</h1>{session && <button className="pixel-button bg-[#fffdf5]" onClick={() => setSession(null)}>← Đổi trò chơi</button>}</div><p className="mt-4 mb-7 text-[#647059]">Mỗi lượt 5 từ. Đúng ngay lần đầu được 10 điểm. Chọn cách chơi theo nhịp của bạn.</p>
    {session ? <div key={session.key}>{session.mode === "match" ? <MatchingGame words={session.words} replay={() => start(session.mode)} leave={() => setSession(null)} /> : <QuizGame session={session} replay={() => start(session.mode)} leave={() => setSession(null)} />}</div>
      : <><label className="mb-7 block max-w-sm">Chủ đề<select className="mt-2 block w-full border-2 border-[#29392a] bg-[#fffdf5] p-3" value={topic} onChange={e => setTopic(e.target.value)}><option value="">Tất cả chủ đề</option>{topics.map(t => <option key={t}>{t}</option>)}</select></label><p role="status">{message}</p><div className="grid gap-6 md:grid-cols-2">{games.map(game => <article key={game.mode} className={`pixel-panel p-6 ${game.color}`}><span className="pixel-icon bg-[#fffdf5]" aria-hidden="true">{game.icon}</span><h2 className="mt-5 text-3xl">{game.title}</h2><p className="mt-3 min-h-20 text-[#52604a]">{game.detail}</p><button className="pixel-button mt-6 bg-[#fffdf5]" onClick={() => start(game.mode)}>Chơi {game.title.toLocaleLowerCase("vi")} →</button></article>)}</div></>}
  </>;
}
