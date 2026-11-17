"use client";
import { useRef, useState, type FormEvent } from "react";
import { fullWord } from "@/lib/vocabulary";
import { validateTopicName, type CustomWord } from "@/lib/custom-vocabulary";
import { useCustomVocabulary } from "./custom-vocabulary-store";
import { AIExample } from "./ai-example";

const field = "vocabulary-filter mt-2 block w-full min-w-0 border-2 border-[#29392a] bg-[#fffdf5] px-3 py-2";
export function FlashcardEditor({ selectedTopic, onSelect, mode = "all" }: { selectedTopic: string; onSelect: (topic: string) => void; mode?: "topics" | "cards" | "all" }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const germanInput = useRef<HTMLInputElement>(null);
  const { data, ready, error, update } = useCustomVocabulary();
  const [editing, setEditing] = useState<CustomWord | null>(null);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const [savingTopic, setSavingTopic] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const topic = data.topics.find(t => t.name === selectedTopic);
  const words = data.words.filter(w => w.topicId === topic?.id);
  function insertGermanCharacter(character: string) {
    const input = germanInput.current;
    if (!input) return;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    input.focus();
    if (input.value.length - (end - start) + character.length > input.maxLength) return;
    input.setRangeText(character, start, end, "end");
  }
  async function createTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get("name") ?? "").trim();
    setFailure(""); setMessage(""); setSavingTopic(true);
    try {
      validateTopicName(name, data);
      const response = await fetch("/api/topics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Không lưu được chủ đề. Hãy thử lại.");
      update(current => ({ ...current, topics: [...current.topics, result.topic] }));
      setEditing(null); setDeleting(false); onSelect(result.topic.name); form.reset();
      requestAnimationFrame(() => dialog.current?.querySelector<HTMLInputElement>('[name="german"]')?.focus());
      setMessage("Đã lưu chủ đề. Thêm thẻ từ đầu tiên bên dưới nhé!");
      if (mode === "topics") dialog.current?.close();
    } catch (error) { setFailure(error instanceof Error ? error.message : "Không lưu được chủ đề. Hãy thử lại."); }
    finally { setSavingTopic(false); }
  }
  async function saveWord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const get = (name: string) => String(values.get(name) ?? "").trim();
    if (!topic) { setFailure("Hãy tạo hoặc chọn chủ đề trước."); return; }
    setFailure(""); setMessage(""); setSavingTopic(true);
    try {
      const germanInput = get("german");
      const prefix = germanInput.match(/^(der|die|das)\s+/i);
      const article = get("article") || prefix?.[1].toLowerCase();
      if (prefix && get("article") && prefix[1].toLowerCase() !== article) throw new Error("Mạo từ trong ô từ vựng và ô mạo từ chưa khớp.");
      const word: CustomWord = {
        id: editing?.id ?? `custom-${crypto.randomUUID()}`, topicId: topic.id, topic: topic.name,
        german: prefix ? germanInput.slice(prefix[0].length).trim() : germanInput,
        vietnamese: get("vietnamese"), ipa: get("ipa"), example: get("example"), translation: get("translation"),
        ...(article ? { article: article as CustomWord["article"] } : {}),
        ...(get("plural") ? { plural: get("plural").replace(/^die\s+/i, "") } : {}),
      };
      const response = await fetch(`/api/topics/${topic.id}/flashcards`, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...word, id: editing?.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Không lưu được thẻ từ. Hãy thử lại.");
      const persisted: CustomWord = {
        ...result.flashcard,
        topic: topic.name,
        article: result.flashcard.article ?? undefined,
        plural: result.flashcard.plural ?? undefined,
      };
      update(current => {
        if (!current.topics.some(t => t.id === topic.id)) throw new Error("Chủ đề đã bị xóa ở tab khác. Hãy chọn lại chủ đề.");
        if (editing && !current.words.some(w => w.id === editing.id)) throw new Error("Thẻ đã bị xóa ở tab khác. Hãy tạo thẻ mới.");
        return { ...current, words: editing ? current.words.map(w => w.id === editing.id ? persisted : w) : [...current.words, persisted] };
      });
      setEditing(null); form.reset(); onSelect(topic.name);
      setMessage(editing ? "Đã cập nhật thẻ từ." : "Đã lưu thẻ từ.");
    } catch (error) { setFailure(error instanceof Error ? error.message : "Không lưu được thẻ từ. Hãy thử lại."); }
    finally { setSavingTopic(false); }
  }
  async function removeTopic() {
    if (!topic) return;
    setFailure(""); setSavingTopic(true);
    try {
      const response = await fetch(`/api/topics/${topic.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Không xóa được chủ đề. Hãy thử lại.");
      update(current => ({ ...current, topics: current.topics.filter(item => item.id !== topic.id), words: current.words.filter(word => word.topicId !== topic.id) }));
      setEditing(null); setDeleting(false); onSelect(""); setMessage("Đã xóa chủ đề và các thẻ từ.");
    } catch (error) { setFailure(error instanceof Error ? error.message : "Không thể xóa chủ đề."); }
    finally { setSavingTopic(false); }
  }
  async function removeWord(id: string) {
    if (!topic) return;
    setFailure(""); setSavingTopic(true);
    try {
      const response = await fetch(`/api/topics/${topic.id}/flashcards/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Không xóa được thẻ từ. Hãy thử lại.");
      update(current => ({ ...current, words: current.words.filter(word => word.id !== id) }));
      if (editing?.id === id) setEditing(null);
      setMessage("Đã xóa thẻ từ.");
    } catch (error) { setFailure(error instanceof Error ? error.message : "Không thể xóa flashcard."); }
    finally { setSavingTopic(false); }
  }
  return <>
    <button type="button" disabled={!ready} className="pixel-button mb-7 bg-[#dbe8cc]" onClick={() => { setEditing(null); setDeleting(false); setFailure(""); setMessage(""); dialog.current?.showModal(); }}>{mode === "topics" ? "＋ Tạo chủ đề" : mode === "cards" ? "＋ Thêm / quản lý flashcard" : "＋ Tạo chủ đề / flashcard"}</button>
    <dialog ref={dialog} aria-labelledby="flashcard-editor-title" className={`flashcard-dialog ${mode === "topics" ? "topic-dialog" : ""} pixel-panel bg-[#f5f3e8] p-5 sm:p-7`} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close();
    }}>
    <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-[#f5f3e8] pb-4"><h2 id="flashcard-editor-title" className="text-2xl font-bold">{mode === "topics" ? "Tạo chủ đề mới" : mode === "cards" ? `Flashcard · ${selectedTopic}` : "Chủ đề & flashcard của tôi"}</h2><button type="button" aria-label="Đóng popup" className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-[#29392a] bg-[#fffdf5] text-2xl shadow-[3px_3px_0_#29392a]" onClick={() => dialog.current?.close()}>×</button></div>
    <p className="mt-4 text-sm text-[#647059]">Tạo chủ đề → thêm từ → học bằng flashcard. Chủ đề và flashcard được lưu trong tài khoản của bạn.</p>
    {error && <p role="alert" className="mt-4 border-2 border-[#b56e3e] bg-[#fff0d5] p-3">{error}</p>}
    {failure && <p role="alert" className="mt-4 text-[#9b432c]">{failure}</p>}
    {message && <p role="status" className="mt-4 bg-[#e7efdc] p-3">{message}</p>}
    <div className={`mt-6 grid min-w-0 gap-7 ${mode === "all" ? "xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]" : ""}`}>
      <section className="min-w-0" aria-label="Chủ đề của tôi">
        {mode !== "cards" && <><h2 className="text-xl font-bold">Tạo chủ đề</h2>
        <form onSubmit={createTopic} className="mt-4">
          <label className="block text-sm">Tên chủ đề<input className={field} name="name" placeholder="Ví dụ: Du lịch" required maxLength={80} disabled={!ready} /></label>
          <button disabled={!ready || savingTopic} className="pixel-button mt-4 bg-[#f9cd65]">{savingTopic ? "Đang lưu…" : "Tạo chủ đề"}</button>
        </form></>}
        {mode !== "topics" && <div className="mt-6 border-2 border-[#d8d9c9] bg-[#e7efdc] p-4"><p className="eyebrow">CHỦ ĐỀ ĐANG CHỌN</p><p className="mt-2 font-bold [overflow-wrap:anywhere]">{selectedTopic || "Chưa chọn chủ đề"}</p><p className="mt-2 text-sm text-[#647059]">{topic ? `${words.length} thẻ của bạn. Thẻ mới sẽ được thêm vào chủ đề này.` : selectedTopic ? "Chủ đề này không còn tồn tại. Hãy chọn lại hoặc tạo chủ đề mới." : "Chọn chủ đề của bạn ở bộ lọc ngoài popup, hoặc tạo chủ đề mới tại đây."}</p></div>}
        {topic && <div className="mt-4">
          {!deleting ? <button type="button" aria-label={`Xóa chủ đề ${topic.name}`} title="Xóa chủ đề" className="flex h-11 w-11 items-center justify-center border-2 border-[#9b432c] bg-[#fff0d5] text-[#9b432c] shadow-[3px_3px_0_#29392a]" onClick={() => setDeleting(true)}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="h-5 w-5"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3" /></svg></button> : <div className="mt-4 border-2 border-[#b56e3e] p-3"><p className="text-sm">Xóa “{topic.name}” và tất cả {words.length} thẻ bên trong?</p><div className="mt-3 flex flex-wrap gap-3"><button type="button" disabled={savingTopic} className="pixel-button bg-[#f8dda7]" onClick={() => void removeTopic()}>{savingTopic ? "Đang xóa…" : "Xác nhận xóa"}</button><button type="button" className="underline" onClick={() => setDeleting(false)}>Hủy</button></div></div>}
        </div>}
      </section>
      {mode !== "topics" && <section className="min-w-0" aria-label="Soạn flashcard">
        <h2 className="text-xl font-bold">2. Thêm flashcard{topic ? ` · ${topic.name}` : ""}</h2>
        {!topic ? <p className="mt-4 text-[#647059]">Tạo hoặc chọn một chủ đề trước khi thêm thẻ.</p> : <>
          <form key={topic.id} onSubmit={saveWord} className="mt-4">
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <div className="min-w-0"><label className="block text-sm">Từ tiếng Đức *<input ref={germanInput} className={field} lang="de" name="german" required maxLength={160} placeholder="Bahnhof hoặc der Bahnhof" /></label>
                <div role="group" aria-label="Ký tự tiếng Đức cho từ vựng" className="mt-3 grid grid-cols-4 gap-2">{["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü", "ẞ"].map(character => <button key={character} type="button" lang="de" aria-label={`Chèn ${character}`} className="min-h-11 border-2 border-[#29392a] bg-[#f8dda7] px-3 py-1 shadow-[2px_2px_0_#29392a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none" onPointerDown={event => event.preventDefault()} onClick={() => insertGermanCharacter(character)}>{character}</button>)}</div>
              </div>
              <label className="min-w-0 text-sm">Nghĩa tiếng Việt *<input className={field} name="vietnamese" required maxLength={300} placeholder="Nhà ga" /></label>
              <label className="min-w-0 text-sm">Mạo từ<select className={field} name="article" defaultValue=""><option value="">Không có / nhận từ ô từ vựng</option><option>der</option><option>die</option><option>das</option></select></label>
              <label className="min-w-0 text-sm">Số nhiều<input className={field} lang="de" name="plural" maxLength={160} placeholder="Bahnhöfe (bỏ trống nếu không có)" /></label>
              <label className="min-w-0 text-sm">IPA<input className={field} name="ipa" maxLength={300} placeholder="/tyːɐ/" /></label><label className="min-w-0 text-sm sm:col-span-2">Câu ví dụ tiếng Đức<textarea className={field} lang="de" name="example" rows={2} maxLength={1000} placeholder="Der Bahnhof ist in der Nähe." /></label>
              <label className="min-w-0 text-sm sm:col-span-2">Bản dịch câu ví dụ<textarea className={field} name="translation" rows={2} maxLength={1000} placeholder="Nhà ga ở gần đây." /></label>
            </div>
            {!editing && <AIExample />}
            <div className="mt-5"><button disabled={savingTopic} className="pixel-button bg-[#dbe8cc]">{savingTopic ? "Đang lưu…" : "Thêm flashcard"}</button></div>
          </form>
          <h3 className="mt-7 font-bold">Các thẻ trong chủ đề ({words.length})</h3>
          {!words.length ? <p className="mt-3 text-sm text-[#647059]">Chưa có thẻ. Hãy nhập từ đầu tiên của bạn.</p> : <ul className="mt-3 grid gap-3">{words.map(word => <li key={word.id} className="min-w-0 border-2 border-[#d8d9c9] bg-[#fffdf5] p-3"><div className="flex min-w-0 flex-wrap items-center justify-between gap-3"><div className="min-w-0 [overflow-wrap:anywhere]"><span lang="de" className="font-bold">{fullWord(word)}</span><p className="text-sm text-[#647059]">{word.vietnamese}</p></div><div className="flex gap-4 text-sm"><button type="button" className="underline" aria-expanded={editing?.id === word.id} onClick={() => { setEditing(editing?.id === word.id ? null : word); setFailure(""); setMessage(""); }}>Sửa</button><button type="button" disabled={savingTopic} className="text-[#9b432c] underline" aria-label={`Xóa ${fullWord(word)}`} onClick={() => void removeWord(word.id)}>Xóa</button></div></div>{editing?.id === word.id && <form key={word.id} onSubmit={saveWord} className="mt-5 border-t-2 border-[#d8d9c9] pt-5"><h4 className="mb-4 text-lg font-bold">Sửa flashcard này</h4><div className="grid min-w-0 gap-4 sm:grid-cols-2"><div className="min-w-0"><label className="block text-sm">Từ tiếng Đức *<input ref={germanInput} className={field} lang="de" name="german" required maxLength={160} defaultValue={word.german} /></label><div role="group" aria-label="Ký tự tiếng Đức cho từ vựng" className="mt-3 grid grid-cols-4 gap-2">{["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü", "ẞ"].map(character => <button key={character} type="button" lang="de" aria-label={`Chèn ${character}`} className="min-h-11 border-2 border-[#29392a] bg-[#f8dda7] px-3 py-1 shadow-[2px_2px_0_#29392a]" onPointerDown={event => event.preventDefault()} onClick={() => insertGermanCharacter(character)}>{character}</button>)}</div></div><label className="min-w-0 text-sm">Nghĩa tiếng Việt *<input className={field} name="vietnamese" required maxLength={300} defaultValue={word.vietnamese} /></label><label className="min-w-0 text-sm">Mạo từ<select className={field} name="article" defaultValue={word.article ?? ""}><option value="">Không có</option><option>der</option><option>die</option><option>das</option></select></label><label className="min-w-0 text-sm">Số nhiều<input className={field} lang="de" name="plural" maxLength={160} defaultValue={word.plural ?? ""} /></label><label className="min-w-0 text-sm">IPA<input className={field} name="ipa" maxLength={300} defaultValue={word.ipa ?? ""} placeholder="/tyːɐ/" /></label><label className="min-w-0 text-sm sm:col-span-2">Câu ví dụ tiếng Đức<textarea className={field} lang="de" name="example" rows={2} maxLength={1000} defaultValue={word.example} /></label><label className="min-w-0 text-sm sm:col-span-2">Bản dịch câu ví dụ<textarea className={field} name="translation" rows={2} maxLength={1000} defaultValue={word.translation} /></label></div><div className="mt-5 flex flex-wrap gap-3"><button disabled={savingTopic} className="pixel-button bg-[#dbe8cc]">{savingTopic ? "Đang lưu…" : "Lưu thay đổi"}</button><button type="button" className="pixel-button bg-[#fffdf5]" onClick={() => setEditing(null)}>Hủy</button></div></form>}</li>)}</ul>}
        </>}
      </section>}
    </div>
    </dialog>
  </>;
}
