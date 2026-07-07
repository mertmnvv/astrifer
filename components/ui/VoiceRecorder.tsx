"use client";

import { useEffect, useRef, useState } from "react";

export interface VoiceRecorderValue {
  url: string;
  source: "upload" | "recording";
}

export interface VoiceRecorderProps {
  value: VoiceRecorderValue | null;
  onChange: (value: VoiceRecorderValue | null) => void;
}

/**
 * Local-only voice note capture: upload an existing audio file, or record
 * one live via the microphone. Like PhotoPicker, nothing is uploaded
 * anywhere yet — just an in-browser preview via object URLs.
 */
export function VoiceRecorder({ value, onChange }: VoiceRecorderProps) {
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

  const replaceValue = (url: string, source: VoiceRecorderValue["source"]) => {
    if (value?.url) URL.revokeObjectURL(value.url);
    onChange({ url, source });
  };

  const handleFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    replaceValue(URL.createObjectURL(file), "upload");
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
        replaceValue(URL.createObjectURL(blob), "recording");
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

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-brass-dim/40 bg-panel-navy px-3 py-2.5">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio controls src={value.url} className="h-8 flex-1" />
        <button
          type="button"
          onClick={remove}
          aria-label="Ses kaydını kaldır"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-void text-xs text-brass ring-1 ring-brass-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-md border border-dashed border-brass-dim/50 px-3 py-2 text-xs text-haze transition-colors hover:border-brass-dim focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brass">
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
              recording ? "border-red-400/60 text-red-300" : "border-brass-dim/50 text-haze hover:border-brass-dim"
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
