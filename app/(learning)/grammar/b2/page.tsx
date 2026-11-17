import { Suspense } from "react";
import { GrammarCourse } from "@/app/components/grammar-course";
import { LoadingIndicator } from "@/app/components/loading-indicator";
export const metadata = { title: "Ngữ pháp B2 | Deutsch Learning" };
export default function Page() { return <Suspense fallback={<LoadingIndicator variant="overlay" label="Đang mở ngữ pháp B2…" />}><GrammarCourse level="B2" /></Suspense>; }
