"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Report = { id: string; category: "feedback" | "bug"; message: string; pagePath: string; createdAt: string; userName: string | null; userEmail: string | null };
type Listing = { reports: Report[]; total: number; page: number; pageSize: number };

export function AdminFeedback() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError("");
      try {
        const response = await fetch(`/api/admin/feedback?page=${page}`, { cache: "no-store", signal: controller.signal });
        const result = await response.json().catch(() => null);
        if (response.status === 403) { router.replace("/admin/login"); return; }
        if (!response.ok) throw new Error(result?.error || "Không tải được phản hồi.");
        if (!controller.signal.aborted) {
          if (page > 1 && !result.reports.length) { setPage(Math.max(1, Math.ceil(result.total / result.pageSize))); return; }
          setData(result);
        }
      } catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Không tải được phản hồi."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [page, refresh, router]);
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / 25));
  return <>
    <p className="eyebrow">QUẢN TRỊ HỆ THỐNG</p><div className="mt-4 flex flex-wrap items-center justify-between gap-4"><h1 className="text-4xl">Góp ý / Báo lỗi</h1><button className="pixel-button bg-[#fffdf5]" onClick={() => setRefresh(value => value + 1)}>Tải lại</button></div>
    <p className="my-5 text-[#647059]">Phản hồi người học gửi từ trang học. Mới nhất hiển thị trước.</p>
    <p role="status" className="my-4 text-sm">{loading ? "Đang tải phản hồi…" : `${data?.total ?? 0} phản hồi`}</p>
    {error && <p role="alert" className="my-4 border-2 border-[#b56e3e] bg-[#fff0d5] p-4">{error}</p>}
    <div className="space-y-4" aria-busy={loading}>{data?.reports.map(report => <article key={report.id} className="pixel-panel min-w-0 bg-[#fffdf5] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><span className={`pixel-label ${report.category === "bug" ? "bg-[#f8dda7]" : "bg-[#dbe8cc]"}`}>{report.category === "bug" ? "BÁO LỖI" : "GÓP Ý"}</span><time className="text-sm text-[#647059]" dateTime={report.createdAt}>{new Date(report.createdAt).toLocaleString("vi-VN")}</time></div><p className="mt-5 whitespace-pre-wrap break-words leading-7">{report.message}</p><div className="mt-5 border-t border-[#d8d9c9] pt-4 text-sm text-[#647059]"><p className="break-all">Người gửi: {report.userName || "Người học"}{report.userEmail ? ` · ${report.userEmail}` : " · tài khoản đã xóa"}</p><p className="mt-2 break-all">Trang: {report.pagePath}</p></div></article>)}{!loading && data && !data.reports.length && <p className="pixel-panel bg-[#fffdf5] p-8">Chưa có phản hồi.</p>}</div>
    <div className="my-6 flex flex-wrap items-center justify-between gap-4"><button className="pixel-button bg-[#fffdf5]" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)}>← Trang trước</button><span className="text-sm">Trang {page} / {pages}</span><button className="pixel-button bg-[#fffdf5]" disabled={loading || page >= pages} onClick={() => setPage(value => value + 1)}>Trang tiếp →</button></div>
  </>;
}
