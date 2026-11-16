export function LoadingIndicator({ label = "Đang tải…", variant = "inline" }: { label?: string; variant?: "inline" | "page" | "overlay" }) {
  const layout = variant === "overlay"
    ? "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[#faf8ef]/85 backdrop-blur-sm"
    : variant === "page"
      ? "flex min-h-[40vh] flex-col items-center justify-center gap-4"
      : "inline-flex items-center gap-3";
  return <div role="status" aria-live="polite" className={layout}>
    <span aria-hidden="true" className="inline-block h-6 w-6 animate-spin border-2 border-[#29392a] border-t-transparent motion-reduce:animate-none" />
    <span className="text-sm font-bold text-[#52604a]">{label}</span>
  </div>;
}
