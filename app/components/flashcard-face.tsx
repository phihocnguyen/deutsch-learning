"use client";
import { fullPlural, fullWord, type Word } from "@/lib/vocabulary";

export function FlashcardFace({ word, flipped, status, onFlip }: { word: Word; flipped: boolean; status: string; onFlip: () => void }) {
  const plural = fullPlural(word);
  return <button type="button" className="flip-card block w-full cursor-pointer text-left" onClick={onFlip} aria-label={`${flipped ? "Lật về mặt trước" : "Lật thẻ xem nghĩa"}: ${fullWord(word)}`} aria-pressed={flipped}>
    <span className={`flip-card-rotor ${flipped ? "is-flipped" : ""}`}>
      <span className="flip-card-side flip-card-front p-6 sm:p-10" aria-hidden={flipped}>
        <span className="flex flex-wrap items-center justify-between gap-3"><span className="pixel-label">MẶT TRƯỚC · TIẾNG ĐỨC</span><span className="text-xs">{status}</span></span>
        <span className="my-auto block py-10"><span lang="de" className="block break-words text-4xl sm:text-5xl">{fullWord(word)}</span>{word.plural && <span className="mt-5 block text-[#647059]">Số nhiều: <span lang={plural ? "de" : undefined}>{plural ?? word.plural}</span></span>}<span className="mt-7 block text-[#647059]">Bạn có nhớ nghĩa của từ này không?</span></span>
        <span className="block text-sm text-[#647059]">↻ Bấm bất kỳ đâu trên mặt thẻ để lật</span>
      </span>
      <span className="flip-card-side flip-card-back bg-[#edf2e4] p-6 sm:p-10" aria-hidden={!flipped}>
        <span className="flex flex-wrap items-center justify-between gap-3"><span className="pixel-label">MẶT SAU · NGHĨA & VÍ DỤ</span><span className="text-xs">{status}</span></span>
        <span className="my-auto block py-7"><span lang="de" className="block break-words text-4xl">{fullWord(word)}</span>{word.plural && <span className="mt-3 block text-[#647059]">Số nhiều: <span lang={plural ? "de" : undefined}>{plural ?? word.plural}</span></span>}<span className="mt-5 block text-3xl">{word.vietnamese}</span><span className="mt-5 block border-l-4 border-[#96a87f] pl-4"><span lang="de" className="block">{word.example}</span><span className="mt-2 block text-sm text-[#647059]">{word.translation}</span></span></span>
        <span className="block text-sm text-[#647059]">↻ Bấm để lật về mặt trước · Enter / Space cũng được</span>
      </span>
    </span>
  </button>;
}
