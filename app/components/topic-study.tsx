"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { VocabularyLearning } from "./vocabulary-learning";
export function TopicStudy() {
  const topicId = useSearchParams().get("topic");
  if (!topicId) return <><h1 className="text-3xl">Chọn chủ đề để học</h1><Link href="/flashcards" className="pixel-button mt-6 bg-[#dbe8cc]">← Danh sách chủ đề</Link></>;
  return <VocabularyLearning key={topicId} mode="flashcards" topicId={topicId} />;
}
