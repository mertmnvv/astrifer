"use client";

import { useState } from "react";
import { getJournalPrintPdfDownloadUrlAction, getLetterInsertDownloadUrlAction } from "@/app/admin/(panel)/orders/actions";

export interface DownloadPdfButtonProps {
  orderId: string;
  type: "print" | "letter";
  label: string;
  className?: string;
}

export function DownloadPdfButton({ orderId, type, label, className }: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = type === "print"
        ? await getJournalPrintPdfDownloadUrlAction(orderId)
        : await getLetterInsertDownloadUrlAction(orderId);
        
      window.open(url, "_blank");
    } catch (e) {
      console.error(e);
      setError((e as Error).message || "İndirme bağlantısı oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <button 
        type="button" 
        onClick={handleDownload} 
        disabled={loading}
        className={className}
      >
        {loading ? "Yükleniyor..." : label}
      </button>
      {error && <p className="text-[10px] text-red-500 font-mono mt-1">{error}</p>}
    </div>
  );
}
