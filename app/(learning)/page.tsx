import Link from "next/link";

const paths = [
  { icon: "▤", title: "Flashcard", detail: "Lật thẻ nhỏ. Nhớ từ lâu.", href: "/flashcards", color: "bg-[#dbe8cc]", tag: "HỌC TỪ" },
  { icon: "¶", title: "Ngữ pháp", detail: "Hiểu quy tắc. Tự ghép câu mới.", href: "/grammar", color: "bg-[#f3d9ce]", tag: "XÂY NỀN TẢNG" },
  { icon: "✚", title: "Khu trò chơi", detail: "Thêm một lượt, thêm một từ mới.", href: "/games", color: "bg-[#f8dda7]", tag: "CHƠI & NHỚ" },
  { icon: "✎", title: "Bài tập", detail: "Đưa từ vừa học vào ngữ cảnh.", href: "/exercises", color: "bg-[#e0dff2]", tag: "LUYỆN TẬP" },
];
export default function Home() {
  return <>
    <p className="eyebrow mb-7">▪ MỘT CHÚT TIẾNG ĐỨC MỖI NGÀY</p>
    <section className="pixel-panel relative overflow-hidden bg-[#e1e9d4] p-6 sm:p-10">
      <div className="relative z-10 max-w-lg"><span className="pixel-label">HALLO, NHÀ THÁM HIỂM!</span>
      <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Từ mới nhỏ bé.<br />Hành trình lớn lao<span className="text-[#63814a]">.</span></h1>
      <p className="mt-5 max-w-sm leading-7 text-[#52604a]">Khám phá tiếng Đức qua từ vựng, ngữ pháp A1–A2 cùng bài B1–B2 chọn lọc, trò chơi và bài tập. Bắt đầu từng bước, theo nhịp của bạn.</p>
      <Link href="/flashcards" className="pixel-button mt-7 bg-[#f9cd65]">Khám phá flashcard <span aria-hidden="true">→</span></Link></div>
      <div className="pixel-scene" aria-hidden="true"><span className="scene-sun" /><div className="pixel-book"><span>DE</span><small>A B C</small></div><span className="scene-spark">✦</span><div className="scene-ground" /></div>
      <div className="relative z-10 mt-9 flex flex-wrap gap-5 border-t-2 border-[#c5d0b8] pt-5 text-xs font-bold text-[#52604a]"><span>🇩🇪 Đức → Việt</span><span>✦ Nền tảng A1–A2</span><span>♡ Học theo nhịp của bạn</span></div>
    </section>
    <section className="mt-10" aria-labelledby="adventure-title"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">CHỌN CÁCH HỌC CỦA BẠN</p><h2 id="adventure-title" className="mt-2 text-2xl font-extrabold">Hôm nay, mình học gì?</h2></div><span className="text-sm text-[#6c7163]">Mỗi bước nhỏ đều có ý nghĩa.</span></div>
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{paths.map(path => <Link key={path.href} href={path.href} className="pixel-panel bg-[#fffdf5] p-6 transition-transform hover:-translate-y-1"><span aria-hidden="true" className={`pixel-icon ${path.color}`}>{path.icon}</span><p className="eyebrow mt-6">{path.tag}</p><h3 className="mt-2 text-xl font-bold">{path.title}</h3><p className="mt-3 text-sm leading-6 text-[#6c7163]">{path.detail}</p><span className="mt-6 inline-flex items-center gap-3 text-sm font-bold">Khám phá <span aria-hidden="true">↗</span></span></Link>)}</div></section>
    <section className="mt-8 flex flex-wrap items-center justify-between gap-5 border-2 border-dashed border-[#c6c9b8] p-5"><div><p className="font-bold">Bắt đầu với bộ từ của riêng bạn</p><p className="mt-2 text-sm text-[#6c7163]">Tạo chủ đề → thêm flashcard → luyện tập mỗi ngày</p></div><Link className="pixel-button bg-[#fffdf5]" href="/vocabulary">Thư viện từ →</Link></section>
  </>;
}
