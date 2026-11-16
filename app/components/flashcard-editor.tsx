"use client";
import { useRef, useState, type FormEvent } from "react";
import { fullWord } from "@/lib/vocabulary";
import { validateTopicName, type CustomWord } from "@/lib/custom-vocabulary";
import { useCustomVocabulary } from "./custom-vocabulary-store";

const field = "vocabulary-filter mt-2 block w-full min-w-0 border-2 border-[#29392a] bg-[#fffdf5] px-3 py-2";
export function FlashcardEditor({ selectedTopic, onSelect }: { selectedTopic: string; onSelect: (topic: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { data, ready, error, update } = useCustomVocabulary();
  const [editing, setEditing] = useState<CustomWord | null>(null);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const [deleting, setDeleting] = useState(false);
  const topic = data.topics.find(t => t.name === selectedTopic);
  const words = data.words.filter(w => w.topicId === topic?.id);
  function run(action: () => void) {
    setFailure(""); setMessage("");
    try { action(); } catch (error) { setFailure(error instanceof Error ? error.message : "Không thể lưu thay đổi."); }
  }
  function createTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get("name") ?? "").trim();
    run(() => {
      const id = crypto.randomUUID();
      const saved = update(current => {
        validateTopicName(name, current);
        return { ...current, topics: [...current.topics, { id, name }] };
      });
      setEditing(null); setDeleting(false); onSelect(name); form.reset();
      requestAnimationFrame(() => dialog.current?.querySelector<HTMLInputElement>('[name="german"]')?.focus());
      setMessage(saved ? "Đã tạo chủ đề. Thêm flashcard đầu tiên bên dưới nhé!" : "Đã tạo chủ đề trong phiên này.");
    });
  }
  function saveWord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const get = (name: string) => String(values.get(name) ?? "").trim();
    run(() => {
      if (!topic) throw new Error("Hãy tạo hoặc chọn chủ đề trước.");
      const germanInput = get("german");
      const prefix = germanInput.match(/^(der|die|das)\s+/i);
      const article = get("article") || prefix?.[1].toLowerCase();
      if (prefix && get("article") && prefix[1].toLowerCase() !== article) throw new Error("Mạo từ trong ô từ vựng và ô mạo từ chưa khớp.");
      const word: CustomWord = {
        id: editing?.id ?? `custom-${crypto.randomUUID()}`, topicId: topic.id, topic: topic.name,
        german: prefix ? germanInput.slice(prefix[0].length).trim() : germanInput,
        vietnamese: get("vietnamese"), example: get("example"), translation: get("translation"),
        ...(article ? { article: article as CustomWord["article"] } : {}),
        ...(get("plural") ? { plural: get("plural").replace(/^die\s+/i, "") } : {}),
      };
      const saved = update(current => {
        if (!current.topics.some(t => t.id === topic.id)) throw new Error("Chủ đề đã bị xóa ở tab khác. Hãy chọn lại chủ đề.");
        if (editing && !current.words.some(w => w.id === editing.id)) throw new Error("Thẻ đã bị xóa ở tab khác. Hãy tạo thẻ mới.");
        return { ...current, words: editing ? current.words.map(w => w.id === word.id ? word : w) : [...current.words, word] };
      });
      setEditing(null); form.reset(); onSelect(topic.name);
      setMessage(saved ? (editing ? "Đã cập nhật flashcard." : "Đã thêm flashcard vào chủ đề.") : "Thẻ chỉ được giữ trong phiên này.");
    });
  }
  return <>
    <button type="button" disabled={!ready} className="pixel-button mb-7 bg-[#dbe8cc]" onClick={() => { setEditing(null); setDeleting(false); setFailure(""); setMessage(""); dialog.current?.showModal(); }}>＋ Tạo chủ đề / flashcard</button>
    <dialog ref={dialog} aria-labelledby="flashcard-editor-title" className="flashcard-dialog pixel-panel bg-[#f5f3e8] p-5 sm:p-7" onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close();
    }}>
    <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-[#f5f3e8] pb-4"><h2 id="flashcard-editor-title" className="text-2xl font-bold">Chủ đề & flashcard của tôi</h2><button type="button" aria-label="Đóng popup" className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-[#29392a] bg-[#fffdf5] text-2xl shadow-[3px_3px_0_#29392a]" onClick={() => dialog.current?.close()}>×</button></div>
    <p className="mt-4 text-sm text-[#647059]">Tạo chủ đề → thêm từ → học bằng flashcard. Bộ thẻ của bạn được lưu trên trình duyệt này; xóa dữ liệu trình duyệt sẽ mất bộ thẻ.</p>
    {error && <p role="alert" className="mt-4 border-2 border-[#b56e3e] bg-[#fff0d5] p-3">{error}</p>}
    {failure && <p role="alert" className="mt-4 text-[#9b432c]">{failure}</p>}
    {message && <p role="status" className="mt-4 bg-[#e7efdc] p-3">{message}</p>}
    <div className="mt-6 grid min-w-0 gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <section className="min-w-0" aria-label="Chủ đề của tôi">
        <h2 className="text-xl font-bold">1. Tạo chủ đề</h2>
        <form onSubmit={createTopic} className="mt-4">
          <label className="block text-sm">Tên chủ đề<input className={field} name="name" placeholder="Ví dụ: Du lịch" required maxLength={80} disabled={!ready} /></label>
          <button disabled={!ready} className="pixel-button mt-4 bg-[#f9cd65]">Tạo chủ đề</button>
        </form>
        <div className="mt-6 border-2 border-[#d8d9c9] bg-[#e7efdc] p-4"><p className="eyebrow">CHỦ ĐỀ ĐANG CHỌN</p><p className="mt-2 font-bold [overflow-wrap:anywhere]">{selectedTopic || "Chưa chọn chủ đề"}</p><p className="mt-2 text-sm text-[#647059]">{topic ? `${words.length} thẻ của bạn. Thẻ mới sẽ được thêm vào chủ đề này.` : selectedTopic ? "Chủ đề này không còn tồn tại. Hãy chọn lại hoặc tạo chủ đề mới." : "Chọn chủ đề của bạn ở bộ lọc ngoài popup, hoặc tạo chủ đề mới tại đây."}</p></div>
        {topic && <div className="mt-4">
          <button type="button" className="pixel-button bg-[#dbe8cc]" onClick={() => { onSelect(topic.name); dialog.current?.close(); }}>Học chủ đề này →</button>
          {!deleting ? <button type="button" className="ml-4 text-sm text-[#9b432c] underline" onClick={() => setDeleting(true)}>Xóa chủ đề</button> : <div className="mt-4 border-2 border-[#b56e3e] p-3"><p className="text-sm">Xóa “{topic.name}” và tất cả {words.length} thẻ bên trong?</p><div className="mt-3 flex flex-wrap gap-3"><button type="button" className="pixel-button bg-[#f8dda7]" onClick={() => run(() => {
            const saved = update(current => ({ ...current, topics: current.topics.filter(t => t.id !== topic.id), words: current.words.filter(w => w.topicId !== topic.id) }));
            setEditing(null); setDeleting(false); onSelect(""); setMessage(saved ? "Đã xóa chủ đề và các thẻ bên trong." : "Đã xóa trong phiên này.");
          })}>Xác nhận xóa</button><button type="button" className="underline" onClick={() => setDeleting(false)}>Hủy</button></div></div>}
        </div>}
      </section>
      <section className="min-w-0" aria-label="Soạn flashcard">
        <h2 className="text-xl font-bold">2. {editing ? "Sửa flashcard" : "Thêm flashcard"}{topic ? ` · ${topic.name}` : ""}</h2>
        {!topic ? <p className="mt-4 text-[#647059]">Tạo hoặc chọn một chủ đề trước khi thêm thẻ.</p> : <>
          <form key={`${topic.id}-${editing?.id ?? "new"}`} onSubmit={saveWord} className="mt-4">
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <label className="min-w-0 text-sm">Từ tiếng Đức *<input className={field} lang="de" name="german" required maxLength={160} defaultValue={editing?.german} placeholder="Bahnhof hoặc der Bahnhof" /></label>
              <label className="min-w-0 text-sm">Nghĩa tiếng Việt *<input className={field} name="vietnamese" required maxLength={300} defaultValue={editing?.vietnamese} placeholder="Nhà ga" /></label>
              <label className="min-w-0 text-sm">Mạo từ<select className={field} name="article" defaultValue={editing?.article ?? ""}><option value="">Không có / nhận từ ô từ vựng</option><option>der</option><option>die</option><option>das</option></select></label>
              <label className="min-w-0 text-sm">Số nhiều<input className={field} lang="de" name="plural" maxLength={160} defaultValue={editing?.plural} placeholder="Bahnhöfe (bỏ trống nếu không có)" /></label>
              <label className="min-w-0 text-sm sm:col-span-2">Câu ví dụ tiếng Đức<textarea className={field} lang="de" name="example" rows={2} maxLength={1000} defaultValue={editing?.example} placeholder="Der Bahnhof ist in der Nähe." /></label>
              <label className="min-w-0 text-sm sm:col-span-2">Bản dịch câu ví dụ<textarea className={field} name="translation" rows={2} maxLength={1000} defaultValue={editing?.translation} placeholder="Nhà ga ở gần đây." /></label>
            </div>
            <div className="mt-5 flex flex-wrap gap-4"><button className="pixel-button bg-[#dbe8cc]">{editing ? "Lưu thay đổi" : "Thêm flashcard"}</button>{editing && <button type="button" className="underline" onClick={() => setEditing(null)}>Hủy sửa</button>}</div>
          </form>
          <h3 className="mt-7 font-bold">Các thẻ trong chủ đề ({words.length})</h3>
          {!words.length ? <p className="mt-3 text-sm text-[#647059]">Chưa có thẻ. Hãy nhập từ đầu tiên của bạn.</p> : <ul className="mt-3 grid gap-3">{words.map(word => <li key={word.id} className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-2 border-[#d8d9c9] bg-[#fffdf5] p-3"><div className="min-w-0 [overflow-wrap:anywhere]"><span lang="de" className="font-bold">{fullWord(word)}</span><p className="text-sm text-[#647059]">{word.vietnamese}</p></div><div className="flex gap-4 text-sm"><button type="button" className="underline" aria-label={`Sửa ${fullWord(word)}`} onClick={() => { setEditing(word); setMessage(""); }}>Sửa</button><button type="button" className="text-[#9b432c] underline" aria-label={`Xóa ${fullWord(word)}`} onClick={() => run(() => {
            const saved = update(current => ({ ...current, words: current.words.filter(w => w.id !== word.id) }));
            if (editing?.id === word.id) setEditing(null);
            setMessage(saved ? "Đã xóa flashcard." : "Đã xóa thẻ trong phiên này.");
          })}>Xóa</button></div></li>)}</ul>}
        </>}
      </section>
    </div>
    </dialog>
  </>;
}
