# Proje Durumu — 12 Temmuz 2026

Bu dosya, projenin **güncel durumunu ve bekleyen işleri** takip etmek
için — `CLAUDE.md`'nin aksine zamanla değişmesi beklenir. Yapısal/kalıcı
bilgi için `CLAUDE.md`'ye, geçmiş oturum ayrıntıları için `HANDOFF.md`'ye
bakın (o dosya artık kısmen eskimiş — aşağıdaki maddeler güncel).

## Son yapılan değişiklikler

Bugünkü oturumda 5 commit atıldı (`git log` sırasına göre en yeniden eskiye):

1. **Admin panel: sipariş filtresi + sipariş detay sayfası** — `/admin/orders`'a
   Dijital/Poster/Defter filtresi eklendi, satırlar artık yeni
   `/admin/orders/[id]` detay sayfasına linkli. Detay sayfası ürün
   tipine göre değişen bir görsel önizleme gösteriyor (dijital sayfa
   için canlı iframe, poster için çerçeve mockup'ı, defter için
   kapak+sayfa mockup'ı) ve mevcut imzalı-URL indirme akışını yüzeye
   çıkarıyor.
2. **Deri Defter: dürüst malzeme metni + gerçek sayfa önizlemeleri** —
   "hakiki deri" iddiası kaldırıldı (ürün suni/vegan deri), İçindekiler
   listesindeki 9 madde artık düz metin değil, her biri gerçek bir
   görsel önizlemeyle gösteriliyor.
3. **Dijital Sayfa: zamanla büyüyen fotoğraf zaman çizelgesi** — sabit
   "en fazla 4 foto" yapısı, tarihli girişlerden oluşan bir koleksiyona
   dönüştürüldü. `/create` artık gerçekten bir `starMaps` Firestore
   dokümanı yazıyor (önceden hiç yazmıyordu). Hesap sistemi olmadan
   "sayfa sahibi" kavramı imzalı bir token + cookie ile kuruldu.
4. **Firestore tabanlı, admin panelinden düzenlenebilir fiyat yönetimi**
   — `/admin/pricing` sayfası eklendi; poster boyut/çerçeve fiyatları,
   defter ve dijital sayfa fiyatı artık kod değişikliği gerektirmeden
   güncellenebiliyor.
5. **SSS içerik güncellemesi** — birkaç SSS cevabı daha isabetli
   ürün metinleriyle değiştirildi.

Bunlardan önce (önceki oturumlarda): 300 DPI baskı render pipeline'ı
(Puppeteer, `fd0ebdc`), Deri Defter özellik listesi (`191d641`), genel
karanlık-amber tema yeniden tasarımı (`ab3e425` ve öncesi).

## Bilinen eksikler / TODO

- **Ödeme (iyzico) entegrasyonu yok.** `/checkout` hâlâ bir stub —
  "Ödeme akışı henüz bağlanmadı" yazıyor, gerçek bir sipariş/ödeme
  akışı yok. Dijital Sayfa artık `/create`'te doğrudan oluşturuluyor
  (bkz. yukarıdaki 3. madde) ama fiziksel ürünler (poster/defter) için
  hâlâ ödeme alan hiçbir yol yok.
- **Fiyat güncellemesi:** Fiyatları admin panelinden düzenleme
  *altyapısı* tüm ürünlerde (Dijital Sayfa, Poster'ın 4 boyutu + 3
  çerçeve seçeneği, Deri Defter) tamamlandı ve çalışıyor. Ancak
  Firestore'daki `config/pricing` dokümanı henüz kaydedilmediyse
  `lib/pricing.ts`'teki statik varsayılan sayılar kullanılıyor — bu
  sayıların gerçek/güncel maliyetleri yansıtıp yansıtmadığı ayrı bir
  soru (özellikle Deri Defter için aşağıya bkz.).
- **Admin panel güvenlik kuralı (300 DPI dosyalar hiçbir zaman public
  URL'den erişilemez) uygulandı ve bu oturumda uçtan uca doğrulandı** —
  indirme yalnızca admin oturumu doğrulanmış `getPrintDownloadUrlAction`
  üzerinden, 5 dakikalık imzalı Storage URL'iyle çalışıyor;
  `storage.rules`'ta `starmaps-print/**` herkese kapalı. Bu madde
  tamamlandı sayılabilir, ama Deri Defter (journal) ürünü için 300 DPI
  render pipeline'ı henüz yok (yalnızca poster/çerçeveli poster
  destekleniyor) — bu ayrı bir eksik.
- **SMS hatırlatma sistemi için İYS (İleti Yönetim Sistemi) uyumluluğu
  henüz hukuki olarak teyit edilmedi.** Zaman çizelgesi özelliğinin
  "6 ayda bir yeni an ekleme zamanı geldi" bildirimi şu an yalnızca
  sayfa içi rozet olarak çalışıyor (`lib/starmapTimeline.ts` →
  `isAddWindowOpen()`); SMS gönderimi kasıtlı olarak kapsam dışı
  bırakıldı, ayrı bir işte ele alınacak. İYS uyumluluğu (ticari
  elektronik ileti onayı, vs.) o iş başlamadan önce netleşmeli.
- **KBC Kutu'dan (deri defter üreticisi) gerçek maliyet teklifi henüz
  alınmadı — defter fiyatı tahmini.** `lib/pricing.ts`'teki
  `JOURNAL_PRICE` varsayılanı (ve/veya Firestore'daki canlı değer)
  gerçek üretim maliyetine dayanmıyor.
- **Domain satın alma durumu (astrifer.com / astrifer.net) — BİLİNMİYOR,
  kontrol edilmeli.** Repo içinde bu konuda hiçbir bilgi yok;
  `NEXT_PUBLIC_SITE_URL` `.env.local`'da `http://localhost:3000` olarak
  ayarlı, kod içinde `astrifer.com` yalnızca bir varsayılan/placeholder
  string olarak geçiyor — bu, alan adının satın alındığı anlamına
  gelmiyor.
- **Firebase Storage bucket'ı hiç provision edilmemiş olabilir** —
  `HANDOFF.md`'ye göre önceki oturumda bu yüzden Cloudinary'ye
  geçilmişti (fotoğraf/ses için). 300 DPI baskı dosyaları için Storage
  gerekiyor (`storage.rules`'ta tanımlı) — bu durumun hâlâ geçerli
  olup olmadığı **BİLİNMİYOR, kontrol edilmeli** (bu oturumda print
  render pipeline'ı test edilmedi).
- **`firestore.rules` / `storage.rules` deploy edilip edilmediği
  BİLİNMİYOR** — `HANDOFF.md`'ye göre önceki oturumda `firebase login`
  gerektiği için tamamlanamamıştı; bu oturumda kontrol edilmedi.
- **`ADMIN_PASSWORD=0000`** — `.env.local`'da hâlâ zayıf bir test şifresi
  duruyor, gerçek bir deploy'dan önce değiştirilmeli.
