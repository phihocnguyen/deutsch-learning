import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Navigation } from "./components/navigation";
import { AccountMenu } from "./components/account-menu";
import { Suspense } from "react";

const pixelFont = VT323({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Deutsch Learning — Học từ vựng tiếng Đức",
  description: "Học từ vựng Đức–Việt và ngữ pháp A1–A2 qua flashcard, trò chơi và bài tập có giải thích.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${pixelFont.variable} h-full`}
    >
      <body className="min-h-full">
        <a href="#main" className="skip-link">Đến nội dung chính</a>
        <div className="min-h-dvh w-full lg:grid lg:grid-cols-[clamp(245px,18vw,320px)_minmax(0,1fr)]">
          <aside className="border-b-2 border-[#d8d9c9] bg-[#f5f3e8] p-5 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:self-start lg:overflow-y-auto lg:flex-col lg:border-r-2 lg:border-b-0 lg:px-6 lg:py-9">
            <Link href="/" className="mb-7 flex items-center gap-3 font-mono text-lg font-black"><span className="flex h-10 w-10 items-center justify-center border-2 border-[#29392a] bg-[#f9cd65] shadow-[3px_3px_0_#29392a]" aria-hidden="true">D.</span><span>DEUTSCH<span className="block text-xs tracking-[.3em] text-[#63814a]">LEARNING</span></span></Link>
            <p className="eyebrow mb-4 hidden lg:block">BẢN ĐỒ HỌC TẬP</p><Navigation />
            <div className="mt-auto hidden border-2 border-[#d8d9c9] p-4 lg:block"><span aria-hidden="true" className="text-2xl">✦</span><p className="mt-2 text-sm font-bold">Schritt für Schritt.</p><p className="mt-2 text-xs leading-5 text-[#6c7163]">Từng bước một.<br />Bạn đang làm rất tốt!</p></div>
            <p className="mt-5 hidden font-mono text-[10px] tracking-widest text-[#737866] lg:block">DEUTSCH LEARNING · A1–A2</p>
          </aside>
          <div className="min-h-dvh min-w-0"><header className="flex items-center justify-between gap-4 border-b-2 border-[#d8d9c9] px-6 py-4 sm:px-10"><span className="hidden text-sm font-bold sm:block">Guten Tag! ✳</span><Suspense fallback={<span className="ml-auto h-9 w-24 animate-pulse bg-[#e1e9d4]" />}><div className="ml-auto"><AccountMenu /></div></Suspense></header>
          <main id="main" tabIndex={-1} className="w-full px-6 py-8 sm:px-10 sm:py-10">{children}</main>
          <footer className="mx-6 flex flex-wrap justify-between gap-3 border-t-2 border-[#d8d9c9] py-6 text-xs text-[#6c7163] sm:mx-10"><span>Được tạo cho những bước tiến nhỏ mỗi ngày.</span><span className="font-mono">VIEL ERFOLG! ✦</span></footer></div>
        </div>
      </body>
    </html>
  );
}


