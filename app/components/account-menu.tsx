import { auth, signOut } from "@/auth";
import Image from "next/image";
import Link from "next/link";
import { isAdminEmail } from "@/lib/admin-policy";
import { connection } from "next/server";
import { SignOutButton } from "./sign-out-button";

export async function AccountMenu() {
  await connection();
  const session = await auth();
  const user = session?.user;
  if (!user) return null;
  const initials = (user.name ?? user.email ?? "U").trim().slice(0, 1).toLocaleUpperCase();
  return <details className="account-menu relative">
    <summary aria-label="Mở menu tài khoản" className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border-2 border-[#29392a] bg-[#fffdf5] shadow-[2px_2px_0_#29392a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#63814a] [&::-webkit-details-marker]:hidden">
      {user.image ? <Image src={user.image} alt="" width={40} height={40} unoptimized referrerPolicy="no-referrer" className="h-full w-full rounded-full object-cover" /> : <span aria-hidden="true" className="font-bold">{initials}</span>}
    </summary>
    <div className="absolute right-0 top-14 z-50 w-64 border-2 border-[#29392a] bg-[#fffdf5] p-4 shadow-[4px_4px_0_#29392a]">
      <p className="truncate font-bold">{user.name ?? "Người học"}</p>
      {user.email && <p className="mt-1 truncate text-sm text-[#647059]">{user.email}</p>}
      {isAdminEmail(user.email) && <Link href="/admin/users" className="pixel-button mt-4 block bg-[#dbe8cc]">Quản lý người dùng</Link>}
      <form className="mt-4 border-t-2 border-[#d8d9c9] pt-4" action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
        <SignOutButton />
      </form>
    </div>
  </details>;
}
