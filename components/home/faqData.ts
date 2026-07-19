export interface FaqItemData {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItemData[] = [
  {
    question: "Yıldız haritam gerçekten o anki gökyüzünü mü gösteriyor?",
    answer: "Evet, astronomik olarak tam doğru. Girdiğiniz tarih, saat ve konuma göre o anın gerçek yıldız, gezegen ve Ay konumları hesaplanır — tahmini ya da dekoratif bir çizim değildir.",
  },
  {
    question: "Dijital Sayfa ile Deri Defter arasındaki fark ne?",
    answer: "Dijital Sayfa, size özel kalıcı bir web adresi ve paylaşılabilir bir zaman kapsülü sayfasıdır. Deri Defter ise bu dijital sayfanın fiziksel bir uzantısıdır — dijital sayfanıza götüren bir QR kod içerir, yani Deri Defter'i alanlar dijital deneyimi de otomatik olarak elde eder.",
  },
  {
    question: "Deri Defter kargoya ne zaman verilir?",
    answer: "Ödemenin ardından 5-7 iş günü içinde kargoya verilir. Kargo ücreti fiyata dahildir.",
  },
  {
    question: "Fotoğraf veya ses kaydı eklemek zorunda mıyım?",
    answer: "Hayır, tamamen opsiyoneldir. Yalnızca tarih, saat ve konum bilgisiyle de eksiksiz bir zaman kapsülü oluşturabilirsiniz; fotoğraf ve sesli mesaj isteğe bağlı bir zenginleştirmedir.",
  },
];
