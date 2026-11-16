import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Navigation } from "./components/navigation";

const pixelFont = VT323({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Deutsch Quest — Học từ vựng tiếng Đức",
  description: "Học từ vựng Đức–Việt qua flashcard, trò chơi và bài tập.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${pixelFont.variable} h-full`}
    >
      <body className="min-h-full">
        <a href="#main" className="skip-link">Đến nội dung chính</a>
        <div className="mx-auto min-h-screen max-w-[1600px] lg:grid lg:grid-cols-[245px_1fr]">
          <aside className="border-b-2 border-[#d8d9c9] bg-[#f5f3e8] p-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r-2 lg:border-b-0 lg:px-6 lg:py-9">
            <Link href="/" className="mb-7 flex items-center gap-3 font-mono text-lg font-black"><span className="flex h-10 w-10 items-center justify-center border-2 border-[#29392a] bg-[#f9cd65] shadow-[3px_3px_0_#29392a]" aria-hidden="true">D.</span><span>DEUTSCH<span className="block text-xs tracking-[.3em] text-[#63814a]">QUEST</span></span></Link>
            <p className="eyebrow mb-4 hidden lg:block">BẢN ĐỒ HỌC TẬP</p><Navigation />
            <div className="mt-auto hidden border-2 border-[#d8d9c9] p-4 lg:block"><span aria-hidden="true" className="text-2xl">✦</span><p className="mt-2 text-sm font-bold">Schritt für Schritt.</p><p className="mt-2 text-xs leading-5 text-[#6c7163]">Từng bước một.<br />Bạn đang làm rất tốt!</p></div>
            <p className="mt-5 hidden font-mono text-[10px] tracking-widest text-[#737866] lg:block">DEUTSCH QUEST · A1</p>
          </aside>
          <div className="min-w-0"><header className="flex items-center justify-between gap-4 border-b-2 border-[#d8d9c9] px-6 py-5 sm:px-10"><span className="text-sm font-bold">Guten Tag! ✳</span><span className="flex items-center gap-3 text-xs font-bold text-[#59644f]"><span className="border border-[#b3bea4] bg-[#e1e9d4] px-2 py-1">A1</span> Hành trình của bạn</span></header>
          <main id="main" className="mx-auto max-w-6xl px-6 py-8 sm:px-10 sm:py-10">{children}</main>
          <footer className="mx-6 flex flex-wrap justify-between gap-3 border-t-2 border-[#d8d9c9] py-6 text-xs text-[#6c7163] sm:mx-10"><span>Được tạo cho những bước tiến nhỏ mỗi ngày.</span><span className="font-mono">VIEL ERFOLG! ✦</span></footer></div>
        </div>
      </body>
    </html>
  );
}
