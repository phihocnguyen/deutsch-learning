import { redirect } from "next/navigation";
import { connection } from "next/server";
import { adminSession } from "@/lib/admin";
import { AdminUsers } from "@/app/components/admin-users";
export const metadata = { title: "Quản lý người dùng | Deutsch Learning" };
export const instant = false;
export default async function Page() {
  await connection();
  const session = await adminSession();
  if (!session) redirect("/admin/login");
  return <AdminUsers adminName={session.user.name ?? "Admin"} localAdmin={session.user.id.startsWith("admin:")} />;
}
