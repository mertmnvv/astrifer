"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary/uploadFile";

export interface VideoPickerValue {
  url: string;
  source: "upload" | "recording";
  status: "uploading" | "done" | "error";
  remoteUrl?: string;
}

export interface VideoPickerProps {
  value: VideoPickerValue | null;
  onChange: Dispatch<SetStateAction<VideoPickerValue | null>>;
}

export function VideoPicker({ value, onChange }: VideoPickerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canRecord, setCanRecord] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCanRecord(
      typeof window !== "undefined" &&
      "MediaRecorder" in window &&
      Boolean(navigator.mediaDevices?.getUserMedia)
    );
  }, []);

  useEffect(() => {
    return () => {
      if (value?.url) URL.revokeObjectURL(value.url);
      cleanupStream();
      cleanupTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const cleanupTimers = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
  };

  const uploadBlob = (blob: Blob | File, source: VideoPickerValue["source"]) => {
    uploadToCloudinary(blob, "astrifer/starmaps/videos")
      .then((remoteUrl) => {
        onChange((prev) => (prev && prev.source === source ? { ...prev, status: "done", remoteUrl } : prev));
      })
      .catch(() => {
        onChange((prev) => (prev && prev.source === source ? { ...prev, status: "error" } : prev));
      });
  };

  const replaceValue = (url: string, source: VideoPickerValue["source"], blob: Blob | File) => {
    if (value?.url) URL.revokeObjectURL(value.url);
    onChange({ url, source, status: "uploading" });
    uploadBlob(blob, source);
  };

  const handleFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setError(null);

    // Validate that the uploaded video is <= 20 seconds
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (duration > 20.5) {
        setError("Lütfen en fazla 20 saniyelik bir video yükleyin.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        replaceValue(URL.createObjectURL(file), "upload", file);
      }
      window.URL.revokeObjectURL(video.src);
    };
    video.onerror = () => {
      setError("Geçersiz video dosyası.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    video.src = URL.createObjectURL(file);
  };

  const startRecording = async () => {
    setError(null);
    chunksRef.current = [];
    cleanupTimers();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { width: 640, height: 480 } });
      streamRef.current = stream;

      // Assign to live preview video
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9,opus" });
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        replaceValue(URL.createObjectURL(blob), "recording", blob);
        cleanupStream();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setCountdown(20);

      // Start countdown interval
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            cleanupTimers();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Stop recording automatically at 20 seconds
      autoStopTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 20000);

    } catch (err) {
      console.error(err);
      setError("Kamera veya mikrofona erişilemedi. Tarayıcı izinlerini kontrol edin.");
    }
  };

  const stopRecording = () => {
    cleanupTimers();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
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
      <div className="rounded-2xl border border-amber/50 bg-amber/10 p-4">
        <div className="flex flex-col gap-3">
          <video controls src={value.url} className="w-full max-h-48 rounded-lg bg-black" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-amber font-semibold">
              Video Yüklendi ({value.source === "recording" ? "Kamera Kaydı" : "Dosya"})
            </span>
            <button
              type="button"
              onClick={remove}
              className="text-[10px] uppercase font-mono text-dim hover:text-red-300 transition-colors"
            >
              Kaldır
            </button>
          </div>
        </div>
        {value.status === "uploading" && (
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-dim animate-pulse">Yükleniyor…</p>
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
      {recording ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-500/50 bg-red-950/10 p-4">
          <div className="relative aspect-video max-h-48 rounded-lg overflow-hidden bg-black mx-auto">
            <video ref={previewVideoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]" />
            <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] font-bold text-red-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
              00:{countdown.toString().padStart(2, "0")}
            </div>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="w-full rounded-md border border-red-500/60 bg-red-950/20 py-2.5 font-mono text-[11px] uppercase tracking-widest text-red-300 hover:bg-red-950/40 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 flex items-center justify-center gap-1.5"
          >
            <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
              <rect x="5" y="5" width="14" height="14" rx="2" />
            </svg>
            <span>Kaydı Durdur</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-md border border-dashed border-text/20 bg-text/[0.03] px-3 py-2 text-xs text-muted transition-colors hover:border-text/30 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-amber">
            Dosya Yükle
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(event) => handleFile(event.target.files)}
              className="sr-only"
            />
          </label>
          {canRecord && (
            <button
              type="button"
              onClick={startRecording}
              className="rounded-md border border-text/20 bg-text/[0.03] px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-muted hover:border-text/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            >
              Kamerayı Aç & Kaydet
            </button>
          )}
        </div>
      )}
      
      {error && (
        <p role="alert" className="mt-1.5 text-[11px] text-red-300 font-mono">
          {error}
        </p>
      )}
      <p className="mt-1.5 text-[10px] text-dim">
        Maksimum 20 saniye uzunluğunda bir video yükleyebilirsiniz.
      </p>
    </div>
  );
}
