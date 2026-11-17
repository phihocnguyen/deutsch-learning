"use client";
import { usePathname } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

export function FeedbackButton() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [category, setCategory] = useState<"feedback" | "bug">("feedback");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  function close() { dialog.current?.close(); trigger.current?.focus(); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category, message, pagePath: pathname }) });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Chưa gửi được phản hồi.");
      setSent(true); setMessage("");
    } catch (error) { setError(error instanceof Error ? error.message : "Không kết nối được máy chủ."); }
    finally { setBusy(false); }
  }
  return <>
    <button ref={trigger} type="button" className="pixel-button bg-[#fffdf5] text-sm sm:text-lg" onClick={() => { setSent(false); setError(""); dialog.current?.showModal(); }}>Góp ý/Báo lỗi</button>
    <dialog ref={dialog} aria-labelledby="feedback-title" className="pixel-panel m-auto w-[calc(100%-2rem)] max-w-xl bg-[#fffdf5] p-6 text-[#29392a] backdrop:bg-[#1d2a1e]/60 sm:p-8" onClose={() => trigger.current?.focus()}>
      <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">DEUTSCH LEARNING</p><h2 id="feedback-title" className="mt-2 text-3xl">Góp ý / Báo lỗi</h2></div><button type="button" aria-label="Đóng" className="flex h-11 w-11 items-center justify-center border-2 border-[#29392a] text-2xl" onClick={close}>×</button></div>
      {sent ? <div role="status" className="mt-6 border-2 border-[#8a9a76] bg-[#edf2e4] p-5"><p>Đã gửi phản hồi. Cảm ơn bạn!</p><button type="button" className="pixel-button mt-5 bg-[#fffdf5]" onClick={close}>Đóng</button></div> : <form onSubmit={submit} className="mt-6 space-y-5"><p className="text-sm leading-7 text-[#59644f]">Nội dung và tên trang hiện tại sẽ được gửi cho quản trị viên.</p><label className="block">Loại phản hồi<select value={category} onChange={event => setCategory(event.target.value as "feedback" | "bug")} className="mt-2 block w-full border-2 border-[#29392a] bg-[#faf8ef] p-3"><option value="feedback">Góp ý</option><option value="bug">Báo lỗi</option></select></label><label className="block">Nội dung<textarea required minLength={10} maxLength={2000} rows={6} value={message} onChange={event => setMessage(event.target.value)} placeholder="Bạn muốn góp ý hoặc gặp lỗi gì?" className="mt-2 block w-full border-2 border-[#29392a] bg-[#faf8ef] p-3" /></label><p className="text-sm text-[#647059]">Trang: {pathname}</p>{error && <p role="alert" className="border-2 border-[#b56e3e] bg-[#fff0d5] p-3 text-sm">{error}</p>}<button disabled={busy} aria-busy={busy} className="pixel-button bg-[#f9cd65]">{busy ? "Đang gửi…" : "Gửi phản hồi"}</button></form>}
    </dialog>
  </>;
}
