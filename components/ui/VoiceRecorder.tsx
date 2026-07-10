"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary/uploadFile";

export interface VoiceRecorderValue {
  url: string;
  source: "upload" | "recording";
  status: "uploading" | "done" | "error";
  remoteUrl?: string;
}

export interface VoiceRecorderProps {
  value: VoiceRecorderValue | null;
  onChange: Dispatch<SetStateAction<VoiceRecorderValue | null>>;
  /** Visual register: "dark" (default, night/void panels) or "light" (parchment panels). */
  tone?: "dark" | "light";
}

/**
 * Voice note capture: upload an existing audio file, or record one live via
 * the microphone. Playback always uses the local object URL (instant, no
 * network round-trip); the blob is uploaded to Cloudinary in the background
 * and `remoteUrl`/`status` fill in once that resolves (see PhotoPicker for
 * the same pattern).
 */
export function VoiceRecorder({ value, onChange, tone = "dark" }: VoiceRecorderProps) {
  const isLight = tone === "light";
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canRecord, setCanRecord] = useState(false);

  useEffect(() => {
    setCanRecord(typeof window !== "undefined" && "MediaRecorder" in window && Boolean(navigator.mediaDevices?.getUserMedia));
  }, []);

  useEffect(() => {
    return () => {
      if (value?.url) URL.revokeObjectURL(value.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadBlob = (blob: Blob | File, source: VoiceRecorderValue["source"]) => {
    uploadToCloudinary(blob, "astrifer/starmaps/voice")
      .then((remoteUrl) => {
        onChange((prev) => (prev && prev.source === source ? { ...prev, status: "done", remoteUrl } : prev));
      })
      .catch(() => {
        onChange((prev) => (prev && prev.source === source ? { ...prev, status: "error" } : prev));
      });
  };

  const replaceValue = (url: string, source: VoiceRecorderValue["source"], blob: Blob | File) => {
    if (value?.url) URL.revokeObjectURL(value.url);
    onChange({ url, source, status: "uploading" });
    uploadBlob(blob, source);
  };

  const handleFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    replaceValue(URL.createObjectURL(file), "upload", file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        replaceValue(URL.createObjectURL(blob), "recording", blob);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError("Mikrofona erişilemedi. Tarayıcı izni reddetmiş olabilir.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const remove = () => {
    if (value?.url) URL.revokeObjectURL(value.url);
    onChange(null);
  };

  const retryUpload = async () => {
    if (!value) return;
    const blob = await fetch(value.url).then((res) => res.blob());
    onChange((prev) => (prev ? { ...prev, status: "uploading" } : prev));
    uploadBlob(blob, value.source);
  };

  if (value) {
    return (
      <div
        className={`rounded-md border px-3 py-2.5 ${
          isLight ? "border-ink/25 bg-parchment-dim" : "border-brass-dim/40 bg-panel-navy"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={value.url} className="h-8 flex-1" />
          <button
            type="button"
            onClick={remove}
            aria-label="Ses kaydını kaldır"
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs text-brass ring-1 ring-brass-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass ${
              isLight ? "bg-ink" : "bg-void"
            }`}
          >
            ×
          </button>
        </div>
        {value.status === "uploading" && (
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-brass-dim">Yükleniyor…</p>
        )}
        {value.status === "error" && (
          <button type="button" onClick={() => void retryUpload()} className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-red-300 underline">
            Yüklenemedi — tekrar dene
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label
          className={`cursor-pointer rounded-md border border-dashed px-3 py-2 text-xs transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brass ${
            isLight
              ? "border-ink/30 text-ink/60 hover:border-ink/50"
              : "border-brass-dim/50 text-haze hover:border-brass-dim"
          }`}
        >
          Dosya Yükle
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={(event) => handleFile(event.target.files)}
            className="sr-only"
          />
        </label>
        {canRecord && (
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            aria-pressed={recording}
            className={`rounded-md border px-3 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass ${
              recording
                ? "border-red-400/60 text-red-300"
                : isLight
                  ? "border-ink/30 text-ink/60 hover:border-ink/50"
                  : "border-brass-dim/50 text-haze hover:border-brass-dim"
            }`}
          >
            {recording ? "● Durdur" : "Mikrofonla Kaydet"}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-[11px] text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
