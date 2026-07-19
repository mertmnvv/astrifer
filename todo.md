# Astrifer Yol Haritası ve Bekleyen İşler (Roadmap & TODO)

Bu dosya, platforma eklenecek yeni nesil özelliklerin entegrasyon adımlarını
listelemektedir. Önceki nesil (3D Gök Küresi, Müzik Görselleştirici, AI
Hikaye Asistanı, Gün Döngüsü, Kozmik Senkron) tamamlandı — özetleri
`PROJE_DURUMU.md`'de. Ana sayfaya bu özellikleri sergileyen bir
**Özellik Vitrini** paneli eklendi (`components/home/FeatureShowcase.tsx`,
Hero'nun hemen altında).

## 0. Öncelikli Altyapı (Kritik Eksik)

- [ ] **iyzico Ödeme Entegrasyonu**
  - [ ] iyzico sandbox hesabı + API anahtarlarının `.env`'e doğrulanması
  - [ ] `/checkout`'taki stub akışın gerçek iyzico Checkout Form/Payment API çağrısına bağlanması
  - [ ] Ödeme sonucu webhook/callback'inin sipariş durumunu (`config/pricing` değil, `orders`) güncellemesi
  - [ ] Başarısız/iptal ödeme senaryolarının kullanıcıya gösterimi
- [ ] **Domain & Prod Ortam**
  - [ ] `astrifer.net` DNS yönlendirmesi
  - [ ] Prod `NEXT_PUBLIC_SITE_URL` ve OG/meta URL'lerinin doğrulanması

## 1. Paylaşım & Sosyal

- [ ] **Zengin Önizleme (OG Image)**: `/s/[slug]` için o anın gökyüzünü/başlığını içeren dinamik OG image (Next.js `ImageResponse`) — WhatsApp/Instagram paylaşımında kart olarak görünsün.
- [ ] **Instagram Story Kartı**: Dijital sayfadan tek tıkla 1080x1920 PNG "hikaye kartı" (yıldız haritası + başlık + QR) indirme.
- [ ] **Paylaşılabilir QR Kartı**: `/create` önizlemesindeki `PageLinkCard`'a ek olarak, tek başına indirilebilir şık bir QR görseli.

## 2. Kişiselleştirme Derinliği

- [ ] **Çoklu Önemli An**: Şu an tek `eventDateUtc` var — sayfaya "ilk buluşma", "evlilik", "doğum" gibi birden fazla tarih/gökyüzü ekleyip aralarında geçiş yapabilme.
- [ ] **Takımyıldız Adlandırma**: Kullanıcının kendi takımyıldızına/yıldız grubuna özel bir isim verebilmesi (Yıldız Anahtarı'nda görünür).
- [ ] **İki Dilli Sayfa (TR/EN)**: Dijital sayfa metinlerinin ikinci bir dilde de girilebilmesi, `/s/[slug]?lang=en` ile görüntülenmesi.

## 3. Etkileşim & Hatırlatma

- [ ] **6 Aylık An Ekleme Bildirimi**: Ekleme penceresi açıldığında sayfa sahibine e-posta hatırlatması (mevcut rozet UI'ına ek).
- [ ] **Yıldönümü E-postası**: `eventDateUtc` yıldönümünde sayfa sahibine otomatik "bu anı hatırla" e-postası.
- [ ] **Haftalık Kozmik Bülten (opsiyonel opt-in)**: Sayfa sahibine haftalık gökyüzü/ay evresi özeti.

## 4. Büyüme Altyapısı

- [ ] **İndirim Kodu / Kupon Sistemi**: `config/pricing` altyapısına ek olarak tek kullanımlık/çok kullanımlık kupon kodları.
- [ ] **Hediye Kartı Akışı**: Alıcı bilgisi bilinmeden satın alınıp sonradan bir slug'a bağlanabilen hediye kodu.

---

## Önceki Nesil (Tamamlandı)

- [x] 3D Celestial Globe (Three.js Gök Küresi)
- [x] Ambient Audio Visualizer (Müzik Görselleştirici)
- [x] AI Memory Narrative (AI Hikaye Asistanı) — video/ses transkript girişi hariç
- [x] Dynamic Day/Night Cycle (Gece/Gündüz Canlı Gökyüzü)
- [x] Cosmic Anniversary Sync (Astronomik Olay Vurgusu)
- [x] Hero altına Özellik Vitrini paneli (`FeatureShowcase.tsx`)
