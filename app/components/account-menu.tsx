import { auth, signOut } from "@/auth";
import Image from "next/image";

export async function AccountMenu() {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;
  const initials = (user.name ?? user.email ?? "U").trim().slice(0, 1).toLocaleUpperCase();
  return <div className="flex items-center gap-3">
    {user.image ? <Image src={user.image} alt="" width={36} height={36} unoptimized referrerPolicy="no-referrer" className="h-9 w-9 rounded-full border-2 border-[#29392a] object-cover" /> : <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#29392a] bg-[#f9cd65] font-bold">{initials}</span>}
    <div className="hidden min-w-0 sm:block"><p className="max-w-44 truncate text-sm font-bold">{user.name ?? "Người học"}</p>{user.email && <p className="max-w-44 truncate text-xs text-[#647059]">{user.email}</p>}</div>
    <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
      <button type="submit" className="border-2 border-[#29392a] bg-[#fffdf5] px-3 py-2 text-sm shadow-[2px_2px_0_#29392a] hover:bg-[#dbe8cc]">Đăng xuất</button>
    </form>
  </div>;
}
