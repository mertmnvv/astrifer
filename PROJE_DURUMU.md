# Proje Durumu — 14 Temmuz 2026

Bu dosya, projenin **güncel durumunu ve bekleyen işleri** takip etmek
için — `CLAUDE.md`'nin aksine zamanla değişmesi beklenir. Yapısal/kalıcı
bilgi için `CLAUDE.md`'ye, geçmiş oturum ayrıntıları için `HANDOFF.md`'ye
bakın (o dosya artık kısmen eskimiş — aşağıdaki maddeler güncel).

## Bu oturumda yapılan değişiklik (henüz commit/push edilmedi)

**EN SON: Poster & Çerçeve ürünü sitede satılmaktan tamamen kaldırıldı.**
Aşağıdaki eski maddeler poster'la ilgili anlattıkları açısından artık
geçersiz/tarihi bilgi — güncel durum bu. Kaldırılanlar:

- `/urun/poster` sayfası (route komple silindi) ve ona giden tüm linkler
  (ana sayfa "Koleksiyon" kartı, sepet/checkout boş-durum linkleri,
  `CrossSell` bileşeninin poster girdisi).
- `/create`'teki "Fiziksel Olarak da Saklayın" adımının poster yarısı
  (boyut/çerçeve/renk ruhu seçimi, canlı poster önizlemesi) — artık tek
  kart (Deri Defter).
- Render/baskı motoru: `PosterArt.tsx`, `PosterTextBand.tsx`,
  `PosterPrintFrame.tsx`, `drawNebulaSky.ts`, `drawDeepSkyField.ts`,
  `starColors.ts`, `sceneSeed.ts`, `nebulaMood.ts`, `posterHeadline.ts`,
  `lib/printRender.ts`, `app/print/[slug]/`. Ayrıca daha önce zaten ölü
  kod haline gelmiş `PrintStarChart.tsx` da bu geçişte silindi.
- Şema/tipler: `OrderDoc.size/frameOption/posterColorMood/
  posterPersonalMessage/printFilePath/printFileRenderedAt`,
  `ProductType`'tan `"poster"`/`"framed_poster"`, `PricingConfigDoc`'tan
  `posterSizes/frameOptions`. **Aksiyon gerekebilir:** Firestore'daki
  canlı `config/pricing` dokümanı hâlâ eski `posterSizes`/`frameOptions`
  alanlarını taşıyor olabilir — zararsız (kod artık okumuyor) ama
  `/admin/pricing`'den bir kere kaydedilirse temizlenir.
- Admin panel: sipariş listesi/detayındaki poster'a özel "Baskı Dosyası"
  butonları, boyut/çerçeve gösterimi; `/admin/pricing`'deki poster
  boyut/çerçeve fiyat formları.
- `lib/pricing.ts`'teki `PosterSize`/`FrameOption`/`POSTER_SIZES`/
  `FRAME_OPTIONS`/`DEFAULT_FRAME_OPTION`/`priceFor` (son ikisi zaten
  kullanılmıyordu).

Deri Defter'in kendi render/baskı pipeline'ı (`lib/journalPrintRender.ts`,
`components/journal/**`) ve paylaşılan altyapı (`drawStarChart.ts`,
`palettes.ts`, `printRenderToken.ts`, `printSizing.ts`, `printBrowser.ts`,
`lib/prng.ts`, `components/QrCode.tsx`) bu temizlikten etkilenmedi —
hepsi hâlâ Dijital Sayfa ve/veya Deri Defter tarafından kullanılıyor.

---

**ESKİ (artık poster kısımları geçersiz):** Tüm satın alma akışı
`/create`'e taşındı; `/urun/poster` ve `/urun/defter` artık salt tanıtım
sayfası. Bu, önceki oturumun
"gated CTA" yaklaşımının (owner doğrulaması yoksa `/urun/poster`'da
`?returnTo=/create` ile gönderip geri döndürme) yerini alan daha kökten
bir mimari değişiklik — o yaklaşım artık yok.

- `CreateForm.tsx`'e mevcut 4 adımdan sonra **05 — "Fiziksel Olarak da
  Saklayın"** adımı eklendi: Poster ve Deri Defter için, kullanıcının o
  ana kadar girdiği gerçek tarih/isim/mesaj/fotoğrafla dolan canlı
  önizlemeli (gerçek `PosterArt`+`PosterTextBand`+`FrameMockup` /
  `NightCoverPage` bileşenleri, demo veri değil) iki toggle kart var.
  İşaretlenince boyut/çerçeve/renk ruhu (poster) veya Gelecek Mektubu
  metni + açılış tarihi (defter) alanları CSS grid-rows animasyonuyla
  açılıyor. Sağ sütunda tek bir özet+toplam fiyat bloğu ve tek "Sepete
  Ekle" butonu var — dijital sayfa oluşturulduktan hemen sonra seçili
  poster/defter de aynı slug'la sepete ekleniyor, sonra doğrudan
  `/sepet`'e gidiliyor (artık `returnTo` yönlendirmesi yok).
- `lib/cart.ts`'teki `CartItem`'a `posterConfig`/`journalConfig`
  (structured size/frame/mood, letterText/openingDate) eklendi — bugün
  hâlâ yalnızca localStorage'da yaşıyorlar (ödeme/sipariş API'si hâlâ
  yok, bkz. altta), ama iyzico bağlandığında `OrderDoc`'un zaten var
  olan aynı alanlarını (`size`, `frameOption`, `posterColorMood`,
  `journalLetterText`, `journalLetterOpeningDate`) tekrar parse
  etmeden dolduracak şekilde tasarlandı.
- `/create` artık `lib/createDraft.ts` ile formu localStorage'a
  otomatik kaydediyor (boşken kaydetmiyor) — kullanıcı `/urun/poster`
  ya da `/urun/defter`'i okumaya gidip `/create`'e dönerse taslağı
  kaybetmiyor; başarılı sipariş sonrası taslak temizleniyor. Bu akışta
  bir bug bulunup düzeltildi: taslak restore edilirken şablon
  otomatik-mesaj efekti (React Strict Mode'un dev'deki double-invoke
  davranışı yüzünden) geri yüklenen mesajı eziyordu —
  `pendingTemplateMessageSkip` guard'ı artık URL-hydration dalıyla
  birebir aynı şekilde (şablon değişmese bile) koşulsuz set ediliyor.
- `app/urun/poster/page.tsx` ve `app/urun/defter/page.tsx`'ten TÜM
  input/konfigürasyon kaldırıldı (`PosterConfigurator.tsx` ve
  `JournalConfigurator.tsx` silindi); artık sabit demo veriyle statik
  önizleme + malzeme bilgisi + "Nasıl Çalışır" + SSS + üstte/altta
  "Yaşayan Sayfanızı Oluşturun →" CTA'sı (`/create`'e gider) var.
  `ContinueYourPageBanner.tsx` ve `lib/lastCreatedPage.ts` artık hiçbir
  yerden kullanılmadığı için silindi.
- Playwright ile uçtan uca doğrulandı: poster/defter tanıtım
  sayfalarında hiç input/"Sepete Ekle" kalmadığı, `/create`'te
  poster+defter işaretlenince önizleme+fiyat+özelin doğru güncellendiği,
  taslağın sayfa değişince korunduğu, submit sonrası `/sepet`'te 3
  ürünün de (dijital+çerçeveli poster+defter) doğru fiyat/detayla
  göründüğü, konsolda hata olmadığı.
- **Aynı oturumun devamında `/urun/poster` yukarıdaki minimal
  placeholder'dan tam bir 9 bölümlük vitrin sayfasına genişletildi**
  (hero + "Derin Gökyüzü nedir" + kompozisyon anlatımı + 3 çerçeve
  kartı + QR/Yaşayan Sayfa anlatımı + anı türüne göre nebula tonu
  galerisi + malzeme bilgisi + SSS + kapanış CTA'sı — hâlâ hiç
  input/fiyat yok, tamamen `/create`'e yönlendiren statik içerik).
  `FrameMockup.tsx`'teki düz renkli çerçeve kutucukları gerçek
  ahşap-damar/fırçalanmış-metal CSS dokularına çevrildi (bu bileşen
  paylaşıldığı için `/create` ve admin sipariş önizlemesi de aynı
  yükseltmeyi otomatik aldı). `PosterArt`'a `showQr` prop'u eklendi
  (hero ve anı-türü galerisinde QR rozeti bilinçli olarak gizli).
  Sayfadaki 9 canvas önizlemesinden yalnızca hero anında yükleniyor;
  geri kalanı yeni `components/ui/LazyMount.tsx` ile viewport'a
  girene kadar ertelendi. Puppeteer ile hem masaüstü hem 390px mobil
  genişlikte uçtan uca doğrulandı (yatay taşma yok, lazy-mount gerçek
  kaydırmada çalışıyor, konsolda hata yok). `/urun/defter` bu
  değişiklikten etkilenmedi, hâlâ yukarıdaki minimal placeholder
  halinde.
- **Bulunan, kod dışı bir sorun:** Firestore'daki canlı
  `config/pricing` dokümanı hâlâ "Derin Gökyüzü" yeniden tasarımından
  (a1c8403) ÖNCEKİ çerçeve setini taşıyor ("Doğal Ahşap" var,
  "İnce Siyah Metal" yok) — bu yüzden `DEFAULT_FRAME_OPTION =
  "thin-black-metal"` canlı pricing config'te bulunamıyor, poster
  kartında çerçeve adı/ek ücreti doğru gösterilmiyor (ham `"thin-black-
  metal"` değeri ve ₺0 ek ücret olarak düşüyor). Bu, önceki
  `PosterConfigurator`'ı da aynı şekilde etkiliyordu — bugünkü
  değişiklik bunu yaratmadı, sadece ortaya çıkardı. **Aksiyon
  gerekiyor:** `/admin/pricing`'den fiyatlar yeniden kaydedilmeli (ya
  da Firestore'daki `config/pricing` dokümanı elle güncellenmeli) ki
  "İnce Siyah Metal" canlı sette yer alsın.

Değişen/silinen dosyalar: `app/create/{page,CreateForm}.tsx`,
`lib/cart.ts`, `lib/createDraft.ts` (yeni),
`app/urun/poster/page.tsx` (`PosterConfigurator.tsx` silindi, sonra
tam vitrin sayfasına genişletildi),
`app/urun/defter/page.tsx` (`JournalConfigurator.tsx` silindi),
`components/ContinueYourPageBanner.tsx` (silindi),
`lib/lastCreatedPage.ts` (silindi),
`components/ui/FrameMockup.tsx` (gerçekçi doku),
`components/ui/LazyMount.tsx` (yeni),
`components/astrolab/PosterArt.tsx` (`showQr` prop'u).

## Son yapılan değişiklikler

12 Temmuz'dan bu yana GitHub'a 4 yeni commit atıldı (`git log` sırasına
göre en yeniden eskiye):

1. **Ürünler arası çapraz bağlantıyı derinleştir: sahip görünümü +
   devam-et CTA'sı (#4)** — Dijital sayfa sahibi kendi `/s/[slug]`
   sayfasına döndüğünde poster/defter çapraz satış kartlarını görüyor;
   poster/defter sayfalarında ziyaretçinin en son oluşturduğu sayfayı
   algılayıp doğrudan bağlayan bir "Sayfamdan Devam Et" kısayolu var
   (`lib/lastCreatedPage.ts`, `ContinueYourPageBanner.tsx`). Sahiplik
   doğrulaması yine sunucu tarafında imzalı çerezle; localStorage
   yalnızca hangi slug'ın kontrol edileceğini gösteren kolaylık
   işaretleyicisi.
2. **Gerçek sepet, ürünler arası çapraz yönlendirme, düzenleme akışı
   düzeltmesi ve 3'lü örnek metinler** — `lib/cart.ts` + `lib/useCart.ts`
   ile localStorage tabanlı gerçek çoklu ürün sepeti; Poster/Defter/
   Dijital Sayfa'daki "Sepete Ekle" artık gerçekten çalışıyor, yeni
   `/sepet` sayfası ve header'da rozet ekli sepet ikonu (`CartLink.tsx`)
   var. `components/CrossSell.tsx` ile diğer ürünlere yönlendiren bölüm
   eklendi (poster/defter sayfalarına ayrıca SiteHeader/SiteFooter de
   eklendi). Dijital sayfa "Düzenle" akışı artık mevcut kaydın tüm
   alanlarını `/create`'e query param ile taşıyor. Şablonlardaki tekli
   `defaultMessage` alanı `exampleMessages: string[]` (3'er adet) oldu.
3. **Mobil navigasyon yeniden tasarımı + mobil taşma düzeltmeleri** —
   sağdan açılan hamburger çekmecesi kaldırıldı, soldan açılan yeni bir
   panel geldi; admin panel üst navigasyonuna mobil breakpoint eklendi;
   `ScaledPreview.tsx` ile İçindekiler önizlemelerindeki mobil taşmalar
   düzeltildi.
4. **Poster ve Deri Defter: Derin Gökyüzü + Modern Gece & Altın yeniden
   tasarımı** — Poster artık tarih+konum+anı türünden seeded/procedural
   nebula + Samanyolu + gerçek renk çeşitliliğinde yoğun yıldız alanı
   kullanıyor (`drawNebulaSky.ts`, `drawDeepSkyField.ts`); Deri Defter
   "Modern Gece + Altın" temasına geçti (koyu lacivert kapak, ince-çizgi
   logo, 26 sayfa) ve **bu ürün için 300 DPI baskı render pipeline'ı
   artık var** (`lib/journalPrintRender.ts` — 26 fiziksel sayfa 13 farklı
   dosyaya render ediliyor, mühürlü Gelecek Mektubu eki ayrı ve daha
   kısıtlı bir aksiyona bağlı). Admin sipariş detay sayfasına bu yeni
   pipeline'ı tetikleyen aksiyonlar bağlandı
   (`renderJournalPrintFilesAction`, `renderLetterInsertAction`).

Bunlardan önceki commit geçmişi için önceki oturum notlarına ve
`git log`'a bakın.

## Bilinen eksikler / TODO

- **Ödeme (iyzico) entegrasyonu hâlâ yok.** `/checkout` artık gerçek
  sepeti okuyup gösteriyor ama "Ödemeye Geç" butonu devre dışı —
  "Ödeme akışı henüz bağlanmadı" yazıyor. Bu şu an en büyük eksik: ne
  Dijital Sayfa ne de Deri Defter için gerçek bir sipariş/ödeme akışı
  yok.
- **Deri Defter 300 DPI baskı pipeline'ı artık var (ÇÖZÜLDÜ)** —
  `lib/journalPrintRender.ts` ile 26 sayfa (13 benzersiz dosya) render
  ediliyor ve admin panelden indirilebiliyor; önceki oturumda bu bir
  eksikti, artık değil.
- **Fiyat güncellemesi:** Admin panelden düzenleme altyapısı tüm
  ürünlerde çalışıyor. Firestore'daki `config/pricing` dokümanı henüz
  kaydedilmediyse `lib/pricing.ts`'teki statik varsayılanlar kullanılıyor
  — bu sayıların gerçek maliyetleri yansıtıp yansıtmadığı ayrı bir soru
  (özellikle Deri Defter için aşağıya bkz.).
- **SMS hatırlatma sistemi için İYS uyumluluğu henüz hukuki olarak teyit
  edilmedi.** Zaman çizelgesi "6 ayda bir yeni an ekleme" bildirimi şu an
  yalnızca sayfa içi rozet (`lib/starmapTimeline.ts` → `isAddWindowOpen()`);
  SMS gönderimi kasıtlı olarak kapsam dışı.
- **KBC Kutu'dan (deri defter üreticisi) gerçek maliyet teklifi henüz
  alınmadı — defter fiyatı tahmini.**
- **Domain satın alma durumu (astrifer.com / astrifer.net) —
  BİLİNMİYOR, kontrol edilmeli.** `NEXT_PUBLIC_SITE_URL` hâlâ
  `.env.local`'da `http://localhost:3000`.
- **DOĞRULANDI — `FIREBASE_STORAGE_BUCKET` `.env.local`'da BOŞ.**
  `FIREBASE_PROJECT_ID`/`FIREBASE_CLIENT_EMAIL`/`FIREBASE_PRIVATE_KEY`
  dolu ama storage bucket adı hiç girilmemiş. `lib/firebase/admin.ts`
  bu boş değeri `initializeApp({ storageBucket })`'a geçiriyor —
  `getBucket()` çağrıldığında (journal print pipeline'ı bunu kullanıyor,
  `starmaps-print/` prefix'ine yazıyor) muhtemelen çalışma zamanında hata
  veriyor. Daha da kötüsü,
  `lib/firebase/isConfigured.ts` storage bucket'ı hiç kontrol etmiyor,
  yani uygulama "Firebase yapılandırılmış" deyip devam ediyor — hata
  yalnızca admin panelden bir baskı indirme tetiklendiğinde ortaya
  çıkıyor. **Aksiyon gerekiyor:** gerçek bucket adı Firebase
  Console'dan alınıp `.env.local`'a (ve deploy ortamına) girilmeli.
- **`firestore.rules` / `storage.rules` deploy edilip edilmediği hâlâ
  BİLİNMİYOR ve lokal olarak doğrulanamadı** — repoda `.firebaserc` yok,
  bu makinede Firebase CLI kurulu değil. Firebase Console'dan ya da
  CLI kurup login olduktan sonra kontrol edilmeli.
- **`ADMIN_PASSWORD=0000`** — `.env.local`'da hâlâ zayıf bir test şifresi
  duruyor, gerçek bir deploy'dan önce değiştirilmeli.
