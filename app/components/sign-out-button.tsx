"use client";
import { useFormStatus } from "react-dom";
import { LoadingIndicator } from "./loading-indicator";

export function SignOutButton() {
  const { pending } = useFormStatus();
  return <>
    <button type="submit" disabled={pending} className="pixel-button w-full bg-[#f8dda7]">{pending ? "Đang đăng xuất…" : "Đăng xuất"}</button>
    {pending && <LoadingIndicator variant="overlay" label="Đang đăng xuất…" />}
  </>;
}
