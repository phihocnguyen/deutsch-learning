import { Suspense } from "react";
import { GrammarCourse } from "../../components/grammar-course";
export const metadata = { title: "Ngữ pháp A2 | Deutsch Learning" };
export default function Page() { return <Suspense fallback={<p>Đang mở ngữ pháp A2…</p>}><GrammarCourse level="A2" /></Suspense>; }

