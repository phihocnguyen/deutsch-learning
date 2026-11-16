import Link from "next/link";
import { notFound } from "next/navigation";
const sections: Record<string, { title: string; intro: string; items: string[] }> = {
  vocabulary: { title: "Thư viện từ", intro: "Những từ đầu tiên cho hành trình tiếng Đức của bạn.", items: ["Chào hỏi", "Gia đình", "Đồ ăn", "Nhà cửa", "Sinh hoạt"] },
  flashcards: { title: "Flashcard", intro: "Một từ mới. Một lần lật thẻ. Một bước tiến nhỏ.", items: ["Chọn chủ đề", "Lật thẻ & nghe phát âm", "Đánh dấu từ cần ôn"] },
  games: { title: "Khu trò chơi", intro: "Chơi một chút, nhớ thêm một chút.", items: ["Nối từ Đức–Việt", "Chọn nghĩa đúng", "Nghe đoán từ", "Sắp xếp chữ"] },
  exercises: { title: "Bài tập", intro: "Đưa từ vựng vào những tình huống gần gũi.", items: ["Điền từ vào câu", "Chọn der / die / das", "Dịch từ Việt sang Đức"] },
  progress: { title: "Tiến độ của bạn", intro: "Mỗi từ bạn nhớ là một dấu mốc nhỏ.", items: ["Từ đã nhớ", "Từ cần ôn", "Kết quả bài tập"] },
};
export function generateStaticParams() { return Object.keys(sections).map(section => ({ section })); }
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const content = sections[section];
  if (!content) notFound();
  return <><p className="eyebrow">BẢN ĐỒ HỌC TẬP / {content.title.toLocaleUpperCase("vi")}</p><h1 className="mt-5 text-4xl font-extrabold">{content.title}</h1><p className="mt-4 leading-7 text-[#647059]">{content.intro}</p><div className="mt-8 grid gap-5 sm:grid-cols-2">{content.items.map((item, i) => <div key={item} className="pixel-panel bg-[#fffdf5] p-6"><span className="font-mono text-sm text-[#647059]">0{i + 1}</span><h2 className="mt-4 text-xl font-bold">{item}</h2><p className="mt-3 text-sm text-[#647059]">Đang chuẩn bị trong phase tiếp theo.</p></div>)}</div><div className="mt-8 border-2 border-dashed border-[#c6c9b8] p-5 text-sm leading-7">Giao diện khu học đã sẵn sàng. Nội dung và chức năng học sẽ được bổ sung theo kế hoạch, chưa có kết quả học nào được ghi nhận.</div><Link href="/" className="pixel-button mt-7 bg-[#f9cd65]">← Về tổng quan</Link></>;
}
