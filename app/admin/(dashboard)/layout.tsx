import { redirect } from "next/navigation";
import { connection } from "next/server";
import { adminSession } from "@/lib/admin";
import { AdminSidebar } from "@/app/components/admin-sidebar";

export const instant = false;
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await adminSession();
  if (!session) redirect("/admin/login");
  return <><a href="#main" className="skip-link">Đến nội dung quản trị</a><div className="min-h-dvh lg:grid lg:grid-cols-[270px_minmax(0,1fr)]"><AdminSidebar /><div className="min-w-0"><header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#d8d9c9] bg-[#fffdf5] px-6 py-4 sm:px-10"><span className="pixel-label">KHU VỰC QUẢN TRỊ</span><span className="text-sm">{session.user.name ?? "Admin"}</span></header><main id="main" tabIndex={-1} className="min-w-0 px-6 py-8 sm:px-10 sm:py-10">{children}</main></div></div></>;
}
