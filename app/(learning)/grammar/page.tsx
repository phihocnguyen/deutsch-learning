import Link from "next/link";
import { grammarLessons } from "@/lib/grammar";
import { grammarPath } from "@/lib/grammar/types";
export const metadata = { title: "Ngữ pháp A1–B2 | Deutsch Learning" };
export default function GrammarPage() {
  const sections = [
    { level: "A1", name: "Những câu đầu tiên", detail: "Đại từ chủ ngữ, động từ, mạo từ, Akkusativ và Dativ.", color: "bg-[#dbe8cc]" },
    { level: "A2", name: "Kết nối ý tưởng", detail: "Mệnh đề phụ, đại từ ba cách, giới từ và các cấu trúc mở rộng.", color: "bg-[#f8dda7]" },
    { level: "B1", name: "Đi sâu hơn", detail: "Genitiv, đồng vị và Futur I từ các chủ đề trong PDF của bạn.", color: "bg-[#e0dff2]" },
    { level: "B2", name: "Lời thuật trong văn viết", detail: "Bài chọn lọc về Konjunktiv I từ PDF; chưa phải khóa B2 đầy đủ.", color: "bg-[#f3d9ce]" },
  ] as const;
  return <><p className="eyebrow">XÂY NỀN TẢNG · GHÉP THÀNH CÂU</p><h1 className="mt-4 text-4xl">Ngữ pháp tiếng Đức</h1><p className="my-5 max-w-2xl leading-8 text-[#59644f]">Học A1–A2 theo lộ trình; B1–B2 gồm các bài chọn lọc từ chủ đề trong PDF bạn cung cấp. Mỗi bài có quy tắc, ví dụ và câu luyện.</p><div className="my-8 grid gap-6 md:grid-cols-2">{sections.map(item => { const lessons = grammarLessons.filter(lesson => lesson.level === item.level); return <Link key={item.level} href={grammarPath(item.level)} className={`pixel-panel p-7 ${item.color}`}><span className="pixel-label">NGỮ PHÁP {item.level}</span><h2 className="mt-6 text-3xl">{item.name}</h2><p className="mt-4 min-h-20 text-[#52604a]">{item.detail}</p><p className="mt-5">{lessons.length} bài · {lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0)} câu luyện</p><span className="pixel-button mt-6 bg-[#fffdf5]">Khám phá {item.level} →</span></Link>; })}</div><p className="text-sm text-[#59644f]">Giới từ và Präteritum trong PDF đã nằm ở bài A1–A2. B1/B2 ở đây là bài chọn lọc, không chứng nhận trình độ.</p></>;
}

