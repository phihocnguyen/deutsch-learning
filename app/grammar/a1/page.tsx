import { Suspense } from "react";
import { GrammarCourse } from "../../components/grammar-course";
export const metadata = { title: "Ngữ pháp A1 | Deutsch Learning" };
export default function Page() { return <Suspense fallback={<p>Đang mở ngữ pháp A1…</p>}><GrammarCourse level="A1" /></Suspense>; }

