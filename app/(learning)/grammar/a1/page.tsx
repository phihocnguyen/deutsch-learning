import { Suspense } from "react";
import { GrammarCourse } from "@/app/components/grammar-course";
import { LoadingIndicator } from "@/app/components/loading-indicator";
export const metadata = { title: "Ngữ pháp A1 | Deutsch Learning" };
export default function Page() { return <Suspense fallback={<LoadingIndicator variant="overlay" label="Đang mở ngữ pháp A1…" />}><GrammarCourse level="A1" /></Suspense>; }

