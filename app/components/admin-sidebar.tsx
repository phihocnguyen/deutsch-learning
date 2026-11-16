"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <aside className="border-b-2 border-[#29392a] bg-[#edf2e4] p-5 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:self-start lg:border-r-2 lg:border-b-0 lg:p-6"><Link href="/admin/users" className="flex items-center gap-3 font-mono text-lg font-black"><span aria-hidden="true" className="flex h-11 w-11 items-center justify-center border-2 border-[#29392a] bg-[#f9cd65] shadow-[3px_3px_0_#29392a]">D.</span><span>DEUTSCH<span className="block text-xs tracking-[.25em] text-[#63814a]">ADMIN</span></span></Link><button type="button" className="pixel-button mt-5 bg-[#fffdf5] lg:hidden" aria-controls="admin-navigation" aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? "Đóng menu quản trị" : "Mở menu quản trị"}</button><nav id="admin-navigation" aria-label="Điều hướng quản trị" className={`${open ? "block" : "hidden"} mt-7 lg:block`}><p className="eyebrow mb-4">QUẢN LÝ HỆ THỐNG</p><Link href="/admin/users" onClick={() => setOpen(false)} aria-current={pathname === "/admin/users" ? "page" : undefined} className={`nav-link ${pathname === "/admin/users" ? "nav-active" : ""}`}><span aria-hidden="true">♙</span>Quản lý người dùng</Link></nav><div className="mt-6 border-t-2 border-[#d8d9c9] pt-5 lg:mt-auto"><Link href="/" className="text-sm text-[#52604a] underline">← Về trang học tập</Link><p className="mt-4 text-xs text-[#647059]">DEUTSCH LEARNING · ADMIN</p></div></aside>;
}
