import { Suspense } from "react";
import { TopicStudy } from "@/app/components/topic-study";
import { LoadingIndicator } from "@/app/components/loading-indicator";
export const metadata = { title: "Học theo chủ đề | Deutsch Learning" };
export default function Page() {
  return <Suspense fallback={<LoadingIndicator variant="overlay" label="Đang mở bộ flashcard…" />}><TopicStudy /></Suspense>;
}

