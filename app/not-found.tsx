import Link from "next/link";
export default function NotFound() {
  return <section className="pixel-panel bg-[#e1e9d4] p-6 sm:p-10"><p className="eyebrow">404 · ĐƯỜNG NÀY CHƯA CÓ TRÊN BẢN ĐỒ</p><h1 className="mt-5 text-4xl">Không tìm thấy trang</h1><p className="my-6 text-[#52604a]">Có vẻ bạn đã đi lạc một chút. Quay về để tiếp tục hành trình học tiếng Đức nhé.</p><Link className="pixel-button bg-[#f9cd65]" href="/">Về tổng quan →</Link></section>;
}
