import Link from "next/link";
export function EmptyVocabulary() {
  return <div className="my-6 border-2 border-[#d8d9c9] bg-[#edf2e4] p-5"><h2 className="text-xl font-bold">Bạn chưa có flashcard nào</h2><p className="mt-3 text-[#647059]">Tạo chủ đề và thêm từ trước. Game và bài tập sẽ dùng chính bộ từ của bạn.</p><Link href="/flashcards" className="pixel-button mt-4 bg-[#f9cd65]">Tạo bộ thẻ đầu tiên →</Link></div>;
}
