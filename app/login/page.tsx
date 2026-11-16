import { signIn } from "@/auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata = { title: "Đăng nhập | Deutsch Quest" };
export const instant = false;
export default async function LoginPage() {
  if (await auth()) redirect("/flashcards");
  return <main className="login-page grid min-h-dvh w-full grid-cols-1 lg:grid-cols-[6fr_4fr]">
    <section className="relative flex min-h-[38vh] items-center justify-center overflow-hidden bg-[#e1e9d4] p-6 sm:p-10 lg:min-h-dvh">
      <Image src="/login-illustration.png" alt="Người học đang ôn flashcard tiếng Đức bên cửa sổ" fill priority className="object-cover" sizes="(min-width: 1024px) 60vw, 100vw" />
      <div className="relative z-10 max-w-xl border-2 border-[#29392a] bg-[#faf8ef]/90 p-5 shadow-[5px_5px_0_#29392a] sm:p-8"><p className="eyebrow">DEUTSCH QUEST</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Mỗi từ mới,<br />một bước tiến.</h2><p className="mt-4 text-[#647059]">Tạo bộ từ của riêng bạn, học theo chủ đề và tiếp tục hành trình trên mọi thiết bị.</p></div>
    </section>
    <section className="flex min-h-[62vh] flex-col justify-center px-5 py-10 sm:px-10 lg:min-h-dvh lg:px-12 xl:px-16">
    <p className="eyebrow">DEUTSCH QUEST</p>
    <h1 className="mt-3 text-4xl font-bold">Đăng nhập</h1>
    <p className="mt-3 text-[#647059]">Đăng nhập để lưu chủ đề, flashcard và tiến độ theo tài khoản của bạn.</p>
    <form action={async () => { "use server"; await signIn("google", { redirectTo: "/flashcards" }); }}>
      <button className="pixel-button mt-7 w-full bg-[#fffdf5]" type="submit"><span aria-hidden="true">G</span> Đăng nhập bằng Google</button>
    </form>
    </section>
  </main>;
}
