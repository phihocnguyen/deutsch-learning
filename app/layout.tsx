import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";

const pixelFont = VT323({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Deutsch Learning — Học từ vựng tiếng Đức",
  description: "Học từ vựng Đức–Việt và ngữ pháp A1–A2 qua flashcard, trò chơi và bài tập có giải thích.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${pixelFont.variable} h-full`}
    >
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}


