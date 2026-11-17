import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export const metadata = { title: "Đăng nhập | Deutsch Learning" };
export const instant = false;
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  await connection();
  const params = await searchParams;
  const destination = typeof params.callbackUrl === "string" && params.callbackUrl.startsWith("/") && !/^\/[\\/]/.test(params.callbackUrl) && !params.callbackUrl.startsWith("/login")
    ? params.callbackUrl : "/flashcards";
  if (await auth()) redirect(destination);
  return <main id="main" className="login-page relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8 sm:px-8 lg:py-12">
    <a href="#login-form" className="skip-link">Đến đăng nhập</a>
    <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" style={{ backgroundImage: "radial-gradient(#9dad86 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
    <div className="relative grid w-full max-w-6xl overflow-hidden border-2 border-[#29392a] bg-[#fffdf5] shadow-[8px_8px_0_#29392a] lg:min-h-[650px] lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative flex flex-col justify-between overflow-hidden border-b-2 border-[#29392a] bg-[#dbe8cc] p-7 sm:p-10 lg:border-r-2 lg:border-b-0 lg:p-14">
        <div>
          <div className="inline-flex items-center gap-3 font-mono text-lg font-bold tracking-wide"><span className="flex h-11 w-11 items-center justify-center border-2 border-[#29392a] bg-[#f9cd65] shadow-[3px_3px_0_#29392a]">D.</span> DEUTSCH LEARNING</div>
          <p className="eyebrow mt-12">MỘT CHÚT MỖI NGÀY</p>
          <h1 className="mt-4 max-w-lg text-5xl leading-[1.04] sm:text-6xl">Học tiếng Đức theo nhịp của bạn<span className="text-[#6d8956]">.</span></h1>
          <p className="mt-6 max-w-md leading-7 text-[#52604a]">Gom từ mới thành bộ thẻ riêng, luyện tập trong ngữ cảnh và theo dõi từng bước tiến.</p>
        </div>
        <div className="mt-10 grid max-w-md grid-cols-3 gap-3 text-center text-sm" aria-label="Nội dung học">
          <div className="border-2 border-[#29392a] bg-[#fffdf5] p-3 shadow-[3px_3px_0_#29392a]"><span className="block text-3xl" aria-hidden="true">▤</span>Flashcard</div>
          <div className="border-2 border-[#29392a] bg-[#fffdf5] p-3 shadow-[3px_3px_0_#29392a]"><span className="block text-3xl" aria-hidden="true">✎</span>Ngữ pháp</div>
          <div className="border-2 border-[#29392a] bg-[#fffdf5] p-3 shadow-[3px_3px_0_#29392a]"><span className="block text-3xl" aria-hidden="true">✦</span>Luyện tập</div>
        </div>
      </section>
      <section id="login-form" className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
        <p className="eyebrow">CHÀO MỪNG BẠN TRỞ LẠI</p>
        <h2 className="mt-3 text-4xl sm:text-5xl">Bắt đầu học nhé!</h2>
        <p className="mt-5 leading-7 text-[#647059]">Đăng nhập bằng Google để mở chủ đề và flashcard của tài khoản này.</p>
        <form className="mt-9" action={async () => { "use server"; await signIn("google", { redirectTo: destination }); }}>
          <button className="pixel-button w-full justify-center bg-[#f9cd65] px-4 py-4 text-lg sm:text-xl" type="submit"><span className="flex h-8 w-8 items-center justify-center border-2 border-[#29392a] bg-white font-sans text-lg font-bold" aria-hidden="true">G</span> Tiếp tục với Google <span aria-hidden="true">→</span></button>
        </form>
        <div className="mt-8 border-t-2 border-[#d8d9c9] pt-6 text-sm leading-6 text-[#647059]">Chủ đề và flashcard được lưu theo tài khoản. Tiến độ học trên thiết bị được tách riêng cho từng tài khoản.</div>
      </section>
    </div>
  </main>;
}

