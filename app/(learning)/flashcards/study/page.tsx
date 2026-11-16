import { Suspense } from "react";
import { TopicStudy } from "@/app/components/topic-study";
export const metadata = { title: "Học theo chủ đề | Deutsch Learning" };
export default function Page() {
  return <Suspense fallback={<p role="status">Đang mở bộ flashcard…</p>}><TopicStudy /></Suspense>;
}

