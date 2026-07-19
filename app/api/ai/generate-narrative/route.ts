import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keywords, date, location } = body;

    const inputs = [];
    if (keywords) inputs.push(`Anahtar kelimeler/Anı: ${keywords}`);
    if (date) inputs.push(`Tarih: ${date}`);
    if (location) inputs.push(`Konum: ${location}`);

    const prompt = `
      Sen deneyimli, edebi bir mektup yazarısın. Görevin, bugünden geleceğe yazılan bir
      "zaman kapsülü mektubu" kaleme almak: yazan kişi bu satırları bugün yazıyor ve
      mektup, ileride belirli bir tarihte açılıp okunacak. Sana sunulan anı girdileri ve
      bilgiler doğrultusunda, son derece şiirsel, duygusal, anlamlı ve sıcak tonda bir
      Türkçe zaman kapsülü mektubu yaz.

      Kurallar:
      - Maksimum 2-3 cümle ve 35-40 kelime olsun.
      - Emojiler veya tırnak işaretleri kullanma.
      - Giriş cümlesi veya ek açıklama (örneğin "İşte mektubunuz:") ekleme, doğrudan mesajın kendisini yaz.
      - Herhangi bir marka, ürün veya şirket adından bahsetme; metin tamamen kişisel ve markadan bağımsız olmalı.
      - Türkçe dilbilgisi kurallarına titizlikle uy: doğru büyük/küçük harf kullanımı, doğru noktalama,
        Türkçe karakterleri (ç, ğ, ı, ö, ş, ü) eksiksiz ve doğru kullan, cümleler doğal ve akıcı bir
        Türkçe ile kurulsun. İngilizce kalıp ifadelerin birebir çevirisi gibi görünen, yapay veya
        bozuk Türkçe cümleler kurma.

      Girdiler:
      ${inputs.join("\n")}
    `.trim();

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let text = "";

    if (groqKey) {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200
        })
      });
      const data = await res.json();
      text = data?.choices?.[0]?.message?.content || "";
    } else if (geminiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 200 }
        })
      });
      const data = await res.json();
      text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200
        })
      });
      const data = await res.json();
      text = data?.choices?.[0]?.message?.content || "";
    } else {
      // Fallback/mock generator if no API key is specified (great for sandbox/demo)
      const mockSuggestions = [
        "Yıldızların altında geçirdiğimiz o büyülü gece, sonsuza dek hayatımın en parlak anı olarak kalacak. Seninle gökyüzü her zaman daha berrak.",
        "Gökyüzündeki tüm parıltılar, seninle başladığımız bu yolculuğun eşsiz ışığıdır. Adımlarımız sonsuza dek aynı göğün altında birleşsin.",
        "Gözlerindeki ışıkla aydınlanan o gece, yıldızlar en güzel hikayemizi yazmak için dizilmişti. İyi ki varsın, iyi ki yanımdasın.",
      ];
      const randomIdx = Math.floor(Math.random() * mockSuggestions.length);
      text = `${mockSuggestions[randomIdx]} (Not: GEMINI_API_KEY veya OPENAI_API_KEY tanımlanmadığı için bu örnek bir mektuptur.)`;
    }

    // Clean up formatting
    text = text.replace(/^"|"$/g, "").trim();

    return NextResponse.json({ success: true, text });
  } catch (error: unknown) {
    console.error("AI Generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "AI mektup oluşturulurken bir hata oluştu.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
