import { redirect } from "next/navigation";
import { connection } from "next/server";
import { adminSession } from "@/lib/admin";
import { AdminLogin } from "@/app/components/admin-login";
export const metadata = { title: "Đăng nhập admin | Deutsch Learning" };
export const instant = false;
export default async function Page() {
  await connection();
  if (await adminSession()) redirect("/admin/users");
  return <main id="main" className="flex min-h-dvh w-full items-center justify-center px-5 py-10"><AdminLogin /></main>;
}
