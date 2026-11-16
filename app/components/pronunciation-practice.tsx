"use client";
import { useEffect, useRef, useState } from "react";
import type { Word } from "@/lib/vocabulary";

export function PronunciationPractice({ word }: { word: Word }) {
  const [state, setState] = useState<"idle" | "starting" | "recording" | "scoring">("idle");
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false; pending.current?.abort();
      if (timer.current) clearTimeout(timer.current);
      if (recorder.current) { recorder.current.onstop = null; recorder.current.ondataavailable = null; if (recorder.current.state !== "inactive") recorder.current.stop(); }
      stream.current?.getTracks().forEach(track => track.stop());
    };
  }, []);
  async function start() {
    if (state !== "idle") return;
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
      if (mounted.current) setScore(data.score);
    } catch (error) { if (mounted.current) setError(controller.signal.aborted ? "Chấm điểm quá lâu. Hãy thử lại." : error instanceof Error ? error.message : "Không chấm được điểm."); }
    finally { clearTimeout(timeout); if (mounted.current) setState("idle"); }
  }
  return <div className="mt-5 space-y-3 border-t-2 border-[#d8d9c9] pt-5"><h3 className="font-bold">Kiểm tra phát âm</h3>{word.ipa ? <p>IPA: <span lang="de">{word.ipa}</span></p> : <p className="text-sm text-[#647059]">Bổ sung phiên âm IPA trong phần sửa flashcard để chấm điểm.</p>}<p className="text-sm text-[#647059]">Nghe từ mẫu, rồi đọc từ tiếng Đức. Ghi âm tối đa 15 giây và gửi để chấm điểm.</p><button type="button" className="pixel-button bg-[#f8dda7]" disabled={!word.ipa || state === "starting" || state === "scoring"} onClick={() => state === "recording" ? recorder.current?.stop() : void start()}>{state === "recording" ? "Dừng và chấm điểm" : state === "scoring" ? "Đang chấm điểm…" : state === "starting" ? "Đang mở micro…" : "Ghi âm phát âm"}</button><div role="status">{state === "recording" && <p>Đang ghi âm…</p>}{score !== null && <p className="text-2xl">Điểm phát âm: <strong>{score}/100</strong></p>}</div>{error && <p role="alert" className="text-sm text-[#80421e]">{error}</p>}</div>;
}
