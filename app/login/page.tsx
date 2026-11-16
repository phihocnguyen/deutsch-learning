import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connection } from "next/server";
import Link from "next/link";

export const metadata = { title: "Đăng nhập | Deutsch Learning" };
export const instant = false;
export default async function LoginPage() {
  await connection();
  if (await auth()) redirect("/flashcards");
  return <main className="login-page flex min-h-dvh w-full items-center justify-center px-5 py-10">
    <section className="pixel-panel w-full max-w-md bg-[#fffdf5] p-7 sm:p-10">
      <p className="eyebrow">DEUTSCH LEARNING</p>
      <h1 className="mt-3 text-4xl font-bold">Đăng nhập</h1>
      <p className="mt-3 text-[#647059]">Đăng nhập để lưu chủ đề, flashcard và tiến độ theo tài khoản của bạn.</p>
      <form action={async () => { "use server"; await signIn("google", { redirectTo: "/flashcards" }); }}>
        <button className="pixel-button mt-7 w-full bg-[#dbe8cc]" type="submit"><span aria-hidden="true">G</span> Đăng nhập bằng Google</button>
      </form>
      <Link href="/admin/login" className="mt-5 block text-center text-sm text-[#647059] underline">Đăng nhập quản trị</Link>
    </section>
  </main>;
}

