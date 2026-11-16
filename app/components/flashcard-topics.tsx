"use client";
import Link from "next/link";
import { useState } from "react";
import { useCustomVocabulary } from "./custom-vocabulary-store";
import { useProgress } from "./progress-store";
import { FlashcardEditor } from "./flashcard-editor";

export function FlashcardTopics() {
  const custom = useCustomVocabulary();
  const { progress } = useProgress();
  const [search, setSearch] = useState("");
  const topics = custom.data.topics.filter(topic => topic.name.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")));
  return <>
    <p className="eyebrow">FLASHCARD · BỘ TỪ CỦA BẠN</p>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-4"><h1 className="text-4xl">Chủ đề của bạn</h1><FlashcardEditor mode="topics" selectedTopic="" onSelect={() => {}} /></div>
    <p className="mt-3 text-[#647059]">Chọn một chủ đề để mở bộ flashcard. Mỗi bộ là một góc nhỏ trong hành trình học tiếng Đức của bạn.</p>
    <label className="my-7 block max-w-lg text-sm">Tìm chủ đề<input disabled={!custom.ready} className="vocabulary-filter mt-2 block h-12 w-full border-2 border-[#29392a] bg-[#fffdf5] px-3" placeholder="Nhập tên chủ đề…" value={search} onChange={event => setSearch(event.target.value)} /></label>
    {custom.error && <p role="alert" className="mb-5 bg-[#fff0d5] p-4">{custom.error}</p>}
    {!custom.ready ? <p role="status">Đang tải chủ đề…</p> : !topics.length ? <section className="pixel-panel bg-[#fffdf5] p-7"><span className="pixel-icon bg-[#f9cd65]" aria-hidden="true">▤</span><h2 className="mt-5 text-2xl">{custom.data.topics.length ? "Không tìm thấy chủ đề" : "Bộ từ đầu tiên bắt đầu từ đây"}</h2><p className="mt-3 text-[#647059]">{custom.data.topics.length ? "Thử tìm bằng một tên khác." : "Bấm “Tạo chủ đề”, đặt tên rồi mở chủ đề để thêm flashcard."}</p></section> : <div aria-label="Danh sách chủ đề" className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">{topics.map((topic, index) => {
      const words = custom.data.words.filter(word => word.topicId === topic.id);
      const known = words.filter(word => progress.words[word.id] === "known").length;
      return <Link href={`/flashcards/study?topic=${encodeURIComponent(topic.id)}`} key={topic.id} className="pixel-panel flex min-w-0 flex-col bg-[#fffdf5] p-6 transition-transform hover:-translate-y-1">
        <div className="flex items-center justify-between gap-3"><span className={`pixel-icon ${index % 3 === 0 ? "bg-[#dbe8cc]" : index % 3 === 1 ? "bg-[#f8dda7]" : "bg-[#e0dff2]"}`} aria-hidden="true">▤</span><span className="pixel-label">{words.length} THẺ</span></div>
        <h2 className="mt-7 text-3xl [overflow-wrap:anywhere]">{topic.name}</h2>
        <p className="mt-3 text-sm text-[#647059]">{words.length ? `${known}/${words.length} từ đã nhớ` : "Chưa có thẻ · thêm từ đầu tiên"}</p>
        <div className="mt-5 h-2 border border-[#8a9a76] bg-[#f5f3e8]" aria-hidden="true"><div className="h-full bg-[#7e9863]" style={{ width: `${words.length ? known / words.length * 100 : 0}%` }} /></div>
        <span className="mt-6 border-t-2 border-[#d8d9c9] pt-4 text-sm font-bold">Mở bộ flashcard →</span>
      </Link>;
    })}</div>}
    <p className="mt-7 text-sm text-[#647059]">Bộ thẻ được lưu trong tài khoản và đồng bộ khi bạn đăng nhập trên thiết bị khác.</p>
  </>;
}
