"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const links = [["/", "⌂", "Tổng quan"], ["/vocabulary", "▥", "Thư viện từ"], ["/flashcards", "▤", "Flashcard"], ["/grammar", "¶", "Ngữ pháp A1–A2"], ["/games", "✚", "Trò chơi"], ["/exercises", "✎", "Bài tập"], ["/progress", "↗", "Tiến độ"]];
export function Navigation() {
  const pathname = usePathname();
  return <nav aria-label="Điều hướng chính" className="flex gap-2 overflow-x-auto pb-3 lg:flex-col lg:overflow-visible">{links.map(([href, icon, name]) => { const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`nav-link ${active ? "nav-active" : ""}`}><span aria-hidden="true" className="w-5 text-xl">{icon}</span>{name}</Link>; })}</nav>;
}
