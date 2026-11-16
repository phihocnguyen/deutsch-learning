"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: form.get("username"), password: form.get("password") }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Không đăng nhập được.");
      router.replace("/admin/users"); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Không kết nối được máy chủ."); }
    finally { setBusy(false); }
  }
  return <section className="pixel-panel mx-auto max-w-md bg-[#fffdf5] p-7"><p className="eyebrow">QUẢN TRỊ HỆ THỐNG</p><h1 className="mt-3 text-3xl">Đăng nhập admin</h1><form onSubmit={submit} className="mt-6 space-y-5"><label className="block">Tên đăng nhập<input required name="username" autoComplete="username" maxLength={80} className="mt-2 block w-full border-2 border-[#29392a] bg-[#faf8ef] p-3" /></label><label className="block">Mật khẩu<input required type="password" name="password" autoComplete="current-password" maxLength={1024} className="mt-2 block w-full border-2 border-[#29392a] bg-[#faf8ef] p-3" /></label><button disabled={busy} aria-busy={busy} className="pixel-button w-full bg-[#f9cd65]">{busy ? "Đang đăng nhập…" : "Đăng nhập admin"}</button>{error && <p role="alert" className="text-sm text-[#80421e]">{error}</p>}</form></section>;
}
