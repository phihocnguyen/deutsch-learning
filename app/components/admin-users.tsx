"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { AdminUser, UserAction } from "@/lib/admin-policy";
import { LoadingIndicator } from "./loading-indicator";

type Listing = { users: AdminUser[]; total: number; pageSize: number; currentUserId: string; stats: { total: number; active: number; blocked: number } };
type Selection = { user: AdminUser; action: UserAction["action"] };
const labels = { rename: "Đổi tên", block: "Khóa tài khoản", unblock: "Mở khóa", "revoke-sessions": "Đăng xuất mọi phiên", delete: "Xóa tài khoản" };

export function AdminUsers({ adminName, localAdmin }: { adminName: string; localAdmin: boolean }) {
  const router = useRouter();
  const [data, setData] = useState<Listing | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [name, setName] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError("");
      try {
        const params = new URLSearchParams({ q: query, status, page: String(page) });
        const response = await fetch(`/api/admin/users?${params}`, { cache: "no-store", signal: controller.signal });
        const result = await response.json().catch(() => null);
        if (response.status === 403) { router.replace("/admin/login"); return; }
        if (!response.ok) throw new Error(result?.error || "Không tải được danh sách.");
        if (!controller.signal.aborted) {
          if (page > 1 && !result.users.length) { setPage(Math.max(1, Math.ceil(result.total / result.pageSize))); return; }
          setData(result);
        }
      } catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Không tải được danh sách."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [query, status, page, refresh, router]);

  function open(user: AdminUser, action: Selection["action"]) {
    returnFocus.current = document.activeElement as HTMLElement;
    setSelection({ user, action }); setName(user.name ?? ""); setConfirmation(""); setError("");
    dialog.current?.showModal();
  }
  function close() { dialog.current?.close(); setSelection(null); returnFocus.current?.focus(); }
  async function mutate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selection || busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/users/${selection.user.id}`, {
        method: selection.action === "delete" ? "DELETE" : "PATCH", headers: { "Content-Type": "application/json" },
        body: selection.action === "delete" ? undefined : JSON.stringify({ action: selection.action, ...(selection.action === "rename" ? { name } : {}) }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Không cập nhật được tài khoản.");
      setMessage(`Đã ${labels[selection.action].toLocaleLowerCase("vi")} thành công.`);
      close(); setRefresh(value => value + 1);
    } catch (error) { setError(error instanceof Error ? error.message : "Không cập nhật được tài khoản."); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setLoggingOut(true); setError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("Không đăng xuất được. Hãy thử lại.");
      window.location.replace("/admin/login");
    } catch (error) { setLoggingOut(false); setError(error instanceof Error ? error.message : "Không đăng xuất được."); }
    finally { setBusy(false); }
  }
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / 25));
  const targetLabel = selection?.user.email ?? selection?.user.id ?? "";
  return <>
    {loggingOut && <LoadingIndicator variant="overlay" label="Đang đăng xuất…" />}
    <p className="eyebrow">QUẢN TRỊ HỆ THỐNG</p><div className="mt-4 flex flex-wrap items-center justify-between gap-4"><h1 className="text-4xl">Quản lý người dùng</h1>{localAdmin && <button disabled={busy} className="pixel-button bg-[#fffdf5]" onClick={() => void logout()}>Đăng xuất admin</button>}</div><p className="my-5 text-[#647059]">Xin chào, {adminName}. Quản lý tài khoản và quyền truy cập của người học.</p>
    <div className="my-7 grid grid-cols-3 gap-3">{([["Tổng người dùng", "total", "bg-[#e0dff2]"], ["Đang hoạt động", "active", "bg-[#dbe8cc]"], ["Đã khóa", "blocked", "bg-[#f8dda7]"]] as const).map(([label, key, color]) => <div key={key} className={`border-2 border-[#29392a] p-3 sm:p-5 ${color}`}><p className="text-3xl">{data?.stats[key] ?? "—"}</p><p className="mt-2 text-xs sm:text-sm">{label}</p></div>)}</div>
    <form onSubmit={event => { event.preventDefault(); setPage(1); setQuery(search.trim()); }} className="my-6 flex flex-wrap items-end gap-4"><label className="min-w-0 flex-1">Tìm theo tên hoặc email<input type="search" maxLength={255} value={search} onChange={event => setSearch(event.target.value)} className="mt-2 block w-full border-2 border-[#29392a] bg-[#fffdf5] p-3" placeholder="Tên hoặc email…" /></label><label>Trạng thái<select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="mt-2 block border-2 border-[#29392a] bg-[#fffdf5] p-3"><option value="all">Tất cả</option><option value="active">Đang hoạt động</option><option value="blocked">Đã khóa</option></select></label><button className="pixel-button bg-[#f9cd65]">Tìm kiếm</button><button type="button" className="pixel-button bg-[#fffdf5]" onClick={() => setRefresh(value => value + 1)}>Tải lại</button></form>
    <p role="status" className="my-4 text-sm text-[#52604a]">{loading ? "Đang tải người dùng…" : message || `${data?.total ?? 0} người dùng phù hợp`}</p>{error && !selection && <p role="alert" className="my-4 border-2 border-[#b56e3e] bg-[#fff0d5] p-4">{error}</p>}
    <div className="space-y-4" aria-busy={loading}>{data?.users.map(user => {
      const protectedUser = user.isAdmin || user.id === data.currentUserId;
      return <article key={user.id} className="pixel-panel min-w-0 bg-[#fffdf5] p-5"><div className="flex flex-wrap justify-between gap-4"><div className="min-w-0"><h2 className="break-words text-xl">{user.name || "Chưa đặt tên"}</h2><p className="mt-1 break-all text-sm text-[#647059]">{user.email || "Không có email"}</p><p className="mt-2 text-xs">ID: {user.id} · {user.isAdmin ? "Admin · " : ""}{user.disabled ? "Đã khóa" : "Đang hoạt động"}</p></div><p className="text-sm text-[#52604a]">{user.topicCount} chủ đề · {user.cardCount} thẻ · {user.sessionCount} phiên đăng nhập</p></div><div className="mt-5 flex flex-wrap gap-3"><button disabled={busy || loading} className="pixel-button bg-[#edf2e4]" onClick={() => open(user, "rename")}>Đổi tên</button>{!protectedUser && <><button disabled={busy || loading} className="pixel-button bg-[#f8dda7]" onClick={() => open(user, user.disabled ? "unblock" : "block")}>{user.disabled ? "Mở khóa" : "Khóa"}</button><button disabled={busy || loading || !user.sessionCount} className="pixel-button bg-[#fffdf5]" onClick={() => open(user, "revoke-sessions")}>Đăng xuất mọi phiên</button><button disabled={busy || loading} className="pixel-button bg-[#fffdf5] text-[#9b432c]" onClick={() => open(user, "delete")}>Xóa tài khoản</button></>}</div>{protectedUser && <p className="mt-3 text-xs text-[#647059]">Tài khoản admin được bảo vệ.</p>}</article>;
    })}{!loading && data && !data.users.length && <p className="pixel-panel bg-[#fffdf5] p-8">Không có người dùng phù hợp.</p>}</div>
    <div className="my-6 flex flex-wrap items-center justify-between gap-4"><button className="pixel-button bg-[#fffdf5]" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)}>← Trang trước</button><span className="text-sm">Trang {page} / {pages}</span><button className="pixel-button bg-[#fffdf5]" disabled={loading || page >= pages} onClick={() => setPage(value => value + 1)}>Trang tiếp →</button></div><p className="text-xs leading-6 text-[#647059]">Tài khoản người học được tạo khi đăng nhập Google. Khóa tài khoản ngăn đăng nhập và thu hồi các phiên hiện tại. Admin đăng nhập riêng không nằm trong danh sách người học.</p>
    <dialog ref={dialog} aria-labelledby="admin-action-title" className="pixel-panel mx-auto w-[calc(100%-2rem)] max-w-lg bg-[#fffdf5] p-6 backdrop:bg-black/40" onCancel={event => { event.preventDefault(); if (!busy) close(); }} onClose={() => setSelection(null)}>{selection && <form onSubmit={mutate}><h2 id="admin-action-title" className="text-2xl">{labels[selection.action]}</h2><p className="my-4 break-all">{selection.user.name} · {selection.user.email ?? selection.user.id}</p>{selection.action === "rename" ? <label className="block">Tên hiển thị<input autoFocus required maxLength={255} value={name} onChange={event => setName(event.target.value)} className="my-3 block w-full border-2 border-[#29392a] p-3" /></label> : selection.action === "delete" ? <><p className="my-4 text-sm text-[#9b432c]">Xóa vĩnh viễn tài khoản, chủ đề, flashcard và tiến độ lưu trong database. Nếu đăng nhập Google lại, người dùng sẽ tạo một tài khoản mới.</p><label className="block text-sm">Nhập {targetLabel} để xác nhận<input autoFocus value={confirmation} onChange={event => setConfirmation(event.target.value)} className="my-3 block w-full border-2 border-[#29392a] p-3" /></label></> : <p className="my-4 text-sm">{selection.action === "block" ? "Người dùng sẽ bị đăng xuất và không thể đăng nhập cho đến khi mở khóa." : selection.action === "unblock" ? "Cho phép người dùng đăng nhập trở lại." : "Kết thúc tất cả phiên hiện tại. Người dùng vẫn có thể đăng nhập lại."}</p>}{error && <p role="alert" className="my-3 text-sm text-[#80421e]">{error}</p>}<div className="mt-5 flex flex-wrap gap-3"><button disabled={busy || (selection.action === "delete" && confirmation !== targetLabel) || (selection.action === "rename" && !name.trim())} className="pixel-button bg-[#f8dda7]">{busy ? "Đang xử lý…" : "Xác nhận"}</button><button type="button" disabled={busy} className="pixel-button bg-[#fffdf5]" onClick={close}>Hủy</button></div></form>}</dialog>
  </>;
}
