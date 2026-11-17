"use client";
import { useEffect, useRef, useState } from "react";
import type { Word } from "@/lib/vocabulary";

export function PronunciationPractice({ word }: { word: Word }) {
  const [state, setState] = useState<"idle" | "starting" | "recording" | "scoring">("idle");
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [replaying, setReplaying] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const recordedAudio = useRef<string | null>(null);
  const player = useRef<HTMLAudioElement | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false; pending.current?.abort();
      player.current?.pause();
      if (recordedAudio.current) URL.revokeObjectURL(recordedAudio.current);
      if (timer.current) clearTimeout(timer.current);
      if (recorder.current) { recorder.current.onstop = null; recorder.current.ondataavailable = null; if (recorder.current.state !== "inactive") recorder.current.stop(); }
      stream.current?.getTracks().forEach(track => track.stop());
    };
  }, []);
  async function start() {
    if (state !== "idle") return;
    player.current?.pause(); player.current = null; setReplaying(false);
    if (recordedAudio.current) URL.revokeObjectURL(recordedAudio.current);
    recordedAudio.current = null;
    setError(""); setScore(null); setState("starting");
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error("Trình duyệt chưa hỗ trợ ghi âm. Hãy dùng HTTPS và trình duyệt mới.");
      const input = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current) { input.getTracks().forEach(track => track.stop()); return; }
      stream.current = input;
      const mimeType = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus"].find(type => MediaRecorder.isTypeSupported(type));
      const recording = new MediaRecorder(input, mimeType ? { mimeType } : undefined);
      recorder.current = recording;
      const chunks: Blob[] = [];
      recording.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recording.onerror = () => { recording.onstop = null; input.getTracks().forEach(track => track.stop()); if (timer.current) clearTimeout(timer.current); if (mounted.current) { setState("idle"); setError("Ghi âm thất bại. Hãy thử lại."); } };
      recording.onstop = () => {
        input.getTracks().forEach(track => track.stop()); if (timer.current) clearTimeout(timer.current);
        if (mounted.current) void submit(new Blob(chunks, { type: recording.mimeType }));
      };
      recording.start(); setState("recording");
      timer.current = setTimeout(() => { if (recording.state === "recording") recording.stop(); }, 15000);
    } catch (error) {
      stream.current?.getTracks().forEach(track => track.stop());
      if (mounted.current) { setState("idle"); setError(error instanceof DOMException && error.name === "NotAllowedError" ? "Hãy cho phép truy cập micro để luyện phát âm." : error instanceof Error ? error.message : "Không mở được micro."); }
    }
  }
  async function submit(audio: Blob) {
    setState("scoring");
    const controller = new AbortController(); pending.current = controller;
    const timeout = setTimeout(() => controller.abort(), 65000);
    try {
      if (!audio.size) throw new Error("Chưa thu được âm thanh. Hãy ghi âm lại.");
      if (audio.size > 5 * 1024 * 1024) throw new Error("Bản ghi âm quá lớn. Hãy ghi ngắn hơn.");
      const form = new FormData(); form.set("wordId", word.id);
      const extension = audio.type.includes("mp4") ? "mp4" : audio.type.includes("ogg") ? "ogg" : "webm";
      form.set("audio", audio, `pronunciation.${extension}`);
      const response = await fetch("/api/deutsch-ai/score", { method: "POST", body: form, signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không chấm được điểm.");
      if (mounted.current) {
        recordedAudio.current = URL.createObjectURL(audio);
        setScore(data.score);
      }
    } catch (error) { if (mounted.current) setError(controller.signal.aborted ? "Chấm điểm quá lâu. Hãy thử lại." : error instanceof Error ? error.message : "Không chấm được điểm."); }
    finally { clearTimeout(timeout); if (mounted.current) setState("idle"); }
  }
  async function replay() {
    if (!recordedAudio.current) return;
    if (player.current) { player.current.pause(); player.current = null; setReplaying(false); return; }
    const audio = new Audio(recordedAudio.current);
    player.current = audio;
    audio.onended = () => { player.current = null; setReplaying(false); };
    audio.onerror = () => { player.current = null; setReplaying(false); setError("Không phát lại được bản ghi âm."); };
    try { await audio.play(); if (player.current === audio) setReplaying(true); }
    catch { player.current = null; setReplaying(false); setError("Trình duyệt chưa phát được bản ghi âm."); }
  }
  const scoreColor = score === null ? "" : score < 50 ? "#b8473d" : score < 80 ? "#d5a52d" : "#4c8a50";
  return <div className="mt-5 space-y-3 border-t-2 border-[#d8d9c9] pt-5">
    {word.ipa ? <p>Phiên âm (IPA): <span lang="de">{word.ipa}</span></p> : <p className="text-sm text-[#647059]">Thêm phiên âm trong phần sửa thẻ để luyện phát âm.</p>}
    <p className="text-sm text-[#647059]">Nghe từ mẫu, rồi đọc từ tiếng Đức. Ghi âm tối đa 15 giây và gửi để chấm điểm.</p>
    <button type="button" className="pixel-button bg-[#f8dda7]" disabled={!word.ipa || state === "starting" || state === "scoring"} onClick={() => state === "recording" ? recorder.current?.stop() : void start()}>{state === "recording" ? "Dừng và chấm điểm" : state === "scoring" ? "Đang chấm điểm…" : state === "starting" ? "Đang mở micro…" : "Ghi âm phát âm"}</button>
    <div role="status">
      {state === "recording" && <p>Đang ghi âm…</p>}
      {score !== null && <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div role="progressbar" aria-label="Điểm phát âm" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score} className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full p-2" style={{ background: `conic-gradient(${scoreColor} ${score}%, #d8d9c9 ${score}% 100%)` }}>
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#fffdf5] leading-none"><strong className="font-mono text-2xl">{score}</strong><span className="mt-1 text-xs text-[#647059]">/100</span></div>
          </div>
          <div><p className="font-bold">Điểm phát âm</p><p className="text-sm text-[#647059]">{score < 50 ? "Cần luyện thêm" : score < 80 ? "Đang tiến bộ" : "Rất tốt"}</p></div>
        </div>
        <button type="button" className="inline-flex min-h-10 items-center gap-2 border-2 border-[#29392a] bg-[#e1e9d4] px-3 text-sm shadow-[2px_2px_0_#29392a]" onClick={() => void replay()} aria-label={replaying ? "Dừng phát bản ghi âm" : "Nghe lại bản ghi âm"}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" />{replaying ? <rect x="9" y="9" width="6" height="6" fill="currentColor" stroke="none" /> : <path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none" />}</svg>
          {replaying ? "Dừng phát" : "Nghe lại giọng của bạn"}
        </button>
      </div>}
    </div>
    {error && <p role="alert" className="text-sm text-[#80421e]">{error}</p>}
  </div>;
}
