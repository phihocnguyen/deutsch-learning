"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fullWord, fullPlural, type Word } from "@/lib/vocabulary";
import { useProgress } from "./progress-store";
import { Pronunciation } from "./ai-pronunciation";
import { FlashcardFace } from "./flashcard-face";
import { AIExample } from "./ai-example";
import { PronunciationPractice } from "./pronunciation-practice";
import { ProgressInsights } from "./progress-insights";
import { useCustomVocabulary } from "./custom-vocabulary-store";
import { FlashcardEditor } from "./flashcard-editor";

const statusNames = { known: "Đã nhớ", review: "Cần ôn" };
function WordDetails({ word }: { word: Word }) {
  return <><p className="mt-4 text-lg font-bold">{word.vietnamese}</p>{word.plural && <p className="mt-3 text-sm text-[#647059]">Số nhiều: {fullPlural(word) ?? word.plural}</p>}<div className="my-5 border-l-4 border-[#96a87f] pl-4"><p lang="de" className="font-semibold">{word.example}</p><p className="mt-2 text-sm text-[#647059]">{word.translation}</p></div></>;
}
export function VocabularyLearning({ mode, topicId }: { mode: "library" | "flashcards" | "progress"; topicId?: string }) {
  const router = useRouter();
  const { progress, ready: progressReady, error, setStatus } = useProgress();
  const custom = useCustomVocabulary();
  const ready = progressReady && custom.ready;
  const selectedTopic = custom.data.topics.find(t => t.id === topicId);
  const allWords = topicId ? custom.data.words.filter(w => w.topicId === topicId) : custom.data.words;
  const allTopics = custom.data.topics.map(t => t.name);
  const [filterTopic, setTopic] = useState("");
  const topic = topicId ? selectedTopic?.name ?? "" : filterTopic;
  const [status, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState("");
  const words = allWords.filter(word => (!topic || word.topic === topic) && (!status || (status === "new" ? !progress.words[word.id] : progress.words[word.id] === status)) && `${fullWord(word)} ${word.vietnamese}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  const position = Math.min(index, Math.max(0, words.length - 1));
  const word = words[position];
  const known = allWords.filter(w => progress.words[w.id] === "known").length;
  const review = allWords.filter(w => progress.words[w.id] === "review").length;
  const title = mode === "library" ? "Thư viện từ" : mode === "progress" ? "Tiến độ của bạn" : selectedTopic?.name ?? "Flashcard";
  function reset() { setIndex(0); setRevealed(""); }
  function mark(word: Word, value: "known" | "review") { setStatus(word.id, value); }
  if (topicId && !custom.ready) return <p role="status">Đang tải bộ flashcard…</p>;
  if (topicId && !selectedTopic) return <><h1 className="text-3xl">Không tìm thấy chủ đề</h1><p className="mt-4 text-[#647059]">Chủ đề có thể đã bị xóa hoặc được tạo trên một trình duyệt khác.</p>{custom.error && <p role="alert" className="mt-4">{custom.error}</p>}<Link href="/flashcards" className="pixel-button mt-6 bg-[#dbe8cc]">← Danh sách chủ đề</Link></>;
  if (mode === "progress") return <ProgressInsights />;

  return <>
    <p className="eyebrow [overflow-wrap:anywhere]">HÀNH TRÌNH A1 / {title.toLocaleUpperCase("vi")}</p>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-4"><h1 className="min-w-0 text-4xl font-extrabold [overflow-wrap:anywhere]">{title}</h1><Link className="pixel-button bg-[#f9cd65]" href={topicId ? "/flashcards" : mode === "flashcards" ? "/vocabulary" : "/flashcards"}>{topicId ? "← Các chủ đề" : mode === "flashcards" ? "Xem thư viện →" : "Học flashcard →"}</Link></div>
    <p className="mt-4 leading-7 text-[#647059]">{mode === "flashcards" ? "Thử nhớ nghĩa trước khi lật thẻ. Mỗi lần ôn là một bước tiến." : "Tạo chủ đề và thêm từ của bạn để bắt đầu học."}</p>
    <div className="my-7 grid grid-cols-3 gap-3" aria-label="Tiến độ từ vựng">{[["Đã nhớ", known, "bg-[#dbe8cc]"], ["Cần ôn", review, "bg-[#f8dda7]"], ["Chưa học", allWords.length - known - review, "bg-[#e0dff2]"]].map(([label, count, color]) => <div key={label} className={`border-2 border-[#29392a] p-3 sm:p-5 ${color}`}><p className="font-mono text-2xl font-bold">{ready ? count : "—"}</p><p className="mt-2 text-xs sm:text-sm">{label}</p></div>)}</div>
    <p className="mb-5 text-xs leading-6 text-[#647059]">Tiến độ được lưu trên trình duyệt này, không đồng bộ giữa thiết bị.</p>
    {error && <p role="alert" className="mb-5 border-2 border-[#b56e3e] bg-[#fff0d5] p-4 text-sm leading-6">{error}</p>}
    <FlashcardEditor mode={topicId ? "cards" : "all"} selectedTopic={topic} onSelect={name => { if (topicId && !name) router.push("/flashcards"); setTopic(name); setFilterStatus(""); setSearch(""); reset(); }} />
    <div className={`learning-filters mb-7 grid gap-4 ${topicId ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
      {!topicId && <label className="text-sm font-bold">Chủ đề<select disabled={!ready} value={topic} onChange={e => { setTopic(e.target.value); reset(); }} className="vocabulary-filter mt-2 block h-12 w-full border-2 border-[#29392a] bg-[#fffdf5] px-3 py-2"><option value="">Tất cả chủ đề</option>{allTopics.map(t => <option key={t}>{t}</option>)}</select></label>}
      <label className="text-sm font-bold">Trạng thái<select disabled={!ready} value={status} onChange={e => { setFilterStatus(e.target.value); reset(); }} className="vocabulary-filter mt-2 block h-12 w-full border-2 border-[#29392a] bg-[#fffdf5] px-3 py-2"><option value="">Tất cả từ</option><option value="new">Chưa học</option><option value="known">Đã nhớ</option><option value="review">Cần ôn</option></select></label>
      <label className="text-sm font-bold">Tìm từ<input disabled={!ready} value={search} onChange={e => { setSearch(e.target.value); reset(); }} placeholder="Tiếng Đức hoặc tiếng Việt…" className="vocabulary-filter mt-2 block h-12 w-full border-2 border-[#29392a] bg-[#fffdf5] px-3 py-2" /></label>
    </div>
    {!word ? <div className="pixel-panel bg-[#fffdf5] p-8"><h2 className="text-xl font-bold">{allWords.length ? "Chưa có từ phù hợp" : "Chưa có flashcard"}</h2><p className="my-4 text-sm text-[#647059]">{allWords.length ? "Thử trạng thái hoặc từ khóa khác để tiếp tục học." : topicId ? "Bấm “Thêm / quản lý flashcard” để thêm từ đầu tiên vào chủ đề này." : "Tạo chủ đề và thêm từ của bạn để bắt đầu."}</p>{allWords.length > 0 && <button className="pixel-button bg-[#f9cd65]" onClick={() => { setTopic(""); setFilterStatus(""); setSearch(""); reset(); }}>Xóa bộ lọc</button>}</div> : mode === "flashcards" ? <section aria-label="Thẻ từ vựng" className="mx-auto max-w-2xl">
      <div className="mb-4 flex justify-between text-sm"><span>{word.topic}</span><span role="status">Thẻ {position + 1} / {words.length}</span></div>
      <div className="pixel-panel bg-[#fffdf5]">
      <FlashcardFace key={word.id} word={word} flipped={revealed === word.id} status={ready && progress.words[word.id] ? statusNames[progress.words[word.id]] : "Chưa học"} onFlip={() => setRevealed(revealed === word.id ? "" : word.id)} />
      <div className="border-t-2 border-[#d8d9c9] p-6 sm:p-8">
      <AIExample key={word.id} word={word} />
      <PronunciationPractice key={`practice-${word.id}`} word={word} />
      <div className="flex flex-wrap gap-4"><Pronunciation key={`word-${word.id}`} id={word.id} text={fullWord(word)} />{fullPlural(word) && <Pronunciation key={`plural-${word.id}`} id={`${word.id}-plural`} text={fullPlural(word)!} label="Nghe số nhiều" />}</div>{revealed === word.id && word.example && <div className="mt-5"><Pronunciation key={`sentence-${word.id}`} id={word.id} text={word.example} sentence /></div>}
      <div className="mt-6 flex flex-wrap gap-3 border-t-2 border-[#d8d9c9] pt-6"><button disabled={!ready} aria-pressed={progress.words[word.id] === "review"} className="pixel-button bg-[#f8dda7]" onClick={() => mark(word, "review")}>↻ Cần ôn</button><button disabled={!ready} aria-pressed={progress.words[word.id] === "known"} className="pixel-button bg-[#dbe8cc]" onClick={() => mark(word, "known")}>✓ Đã nhớ</button>{progress.words[word.id] && <button className="text-sm underline" onClick={() => setStatus(word.id, undefined)}>Bỏ đánh dấu</button>}</div></div></div>
      <div className="mt-7 flex justify-between gap-3"><button className="pixel-button bg-[#fffdf5]" disabled={position === 0} onClick={() => { setIndex(position - 1); setRevealed(""); }}>← Thẻ trước</button><button className="pixel-button bg-[#fffdf5]" disabled={position === words.length - 1} onClick={() => { setIndex(position + 1); setRevealed(""); }}>Thẻ tiếp →</button></div>
      {position === words.length - 1 && <p role="status" className="mt-5 text-sm text-[#647059]">Bạn đang ở thẻ cuối của bộ lọc này. Có thể quay lại hoặc chọn một chủ đề khác.</p>}
    </section> : <><p className="mb-4 text-sm text-[#647059]" role="status">{words.length} từ phù hợp</p><div className="grid gap-6 xl:grid-cols-2">{words.map(item => <article key={item.id} className="pixel-panel bg-[#fffdf5] p-6"><div className="flex flex-wrap justify-between gap-3"><p className="eyebrow">{item.topic}</p><span className="text-xs font-bold">{ready && progress.words[item.id] ? statusNames[progress.words[item.id]] : "Chưa học"}</span></div><h2 lang="de" className="mt-4 text-2xl font-extrabold">{fullWord(item)}</h2><WordDetails word={item} /><Pronunciation id={item.id} text={fullWord(item)} />{item.example && <details className="mt-4"><summary className="cursor-pointer text-sm underline">Nghe câu ví dụ</summary><div className="mt-3"><Pronunciation id={item.id} text={item.example} sentence /></div></details>}<div className="mt-5 flex flex-wrap gap-3"><button disabled={!ready} className="pixel-button bg-[#f8dda7]" aria-pressed={progress.words[item.id] === "review"} onClick={() => mark(item, "review")}>Cần ôn</button><button disabled={!ready} className="pixel-button bg-[#dbe8cc]" aria-pressed={progress.words[item.id] === "known"} onClick={() => mark(item, "known")}>Đã nhớ</button>{progress.words[item.id] && <button className="text-sm underline" onClick={() => setStatus(item.id, undefined)}>Bỏ đánh dấu</button>}</div></article>)}</div></>}
  </>;
}
