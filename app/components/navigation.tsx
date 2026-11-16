"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
const links = [["/", "⌂", "Tổng quan"], ["/vocabulary", "▥", "Thư viện từ"], ["/flashcards", "▤", "Flashcard"], ["/grammar", "¶", "Ngữ pháp A1–A2"], ["/games", "✚", "Trò chơi"], ["/exercises", "✎", "Bài tập"], ["/progress", "↗", "Tiến độ"]];
export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <div className="relative lg:contents">
    <button type="button" className="pixel-button bg-[#fffdf5] lg:hidden" aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? "Đóng menu" : "Mở menu"} onClick={() => setOpen(value => !value)}>
      <span aria-hidden="true" className="text-2xl leading-none">{open ? "×" : "☰"}</span><span>{open ? "Đóng" : "Menu"}</span>
    </button>
    <nav id="primary-navigation" aria-label="Điều hướng chính" className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-14 z-30 flex-col gap-2 border-2 border-[#29392a] bg-[#f5f3e8] p-3 shadow-[4px_4px_0_#29392a] lg:static lg:flex lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>{links.map(([href, icon, name]) => { const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)); return <Link key={href} href={href} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)} className={`nav-link ${active ? "nav-active" : ""}`}><span aria-hidden="true" className="w-5 text-xl">{icon}</span>{name}</Link>; })}</nav>
  </div>;
}
