# 🌌 Hatırname — Gökyüzü Zaman Kapsülü

> **Hatırname**, hayatınızın en anlamlı anlarını donduran, kişiye özel astronomik gökyüzü haritası ve yaşayan bir zaman kapsülü projesidir. Kullanıcının girdiği konum, tarih ve saat verilerine göre o anın gerçek gökyüzünü hesaplar; bunu kalıcı bir **dijital paylaşım sayfası** ve el yapımı, şık bir fiziksel **Deri Defter** ürünü olarak sunar.

---

## 🛠 Teknoloji Yığını (Tech Stack)

Hatırname modern, performansı yüksek ve güvenli web teknolojileri üzerine inşa edilmiştir:

* **Çatı:** Next.js 14 (App Router), TypeScript, Tailwind CSS
* **Astronomi Motoru:** [`astronomy-engine`](https://github.com/cosinekitty/astronomy) — Gerçek efemeris verileriyle hatasız gökyüzü, takımyıldız ve gezegen hesaplamaları
* **Veritabanı & Storage:** Firebase Firestore & Storage (Yalnızca güvenli Admin SDK üzerinden erişim)
* **Medya Yönetimi:** Cloudinary (İmzalı, istemci tarafı doğrudan fotoğraf ve ses yüklemeleri)
* **Müzik Altyapısı:** YouTube Iframe Player API (Arka planda YouTube videolarından müzik çalma)
* **Baskı Motoru (300 DPI):** Puppeteer + `@sparticuz/chromium` (Sunucu tarafında tarayıcı tabanlı yüksek çözünürlüklü baskı üretimi)

---

## 📐 Sistem Mimarisi ve İş Akışı

Aşağıdaki şema, kullanıcının sipariş oluşturma sürecinden adminin baskı PDF'ini elde etmesine kadar olan uçtan uca akışı özetlemektedir:

```mermaid
graph TD
    User([Kullanıcı]) -->|1. Tarih/Saat/Konum Girer| Configurator[Create Sihirbazı /create]
    Configurator -->|Hesaplama| Astronomy[astronomy-engine]
    Astronomy -->|Gökyüzü Verisi| Preview[Canlı Gökyüzü Önizlemesi]
    Configurator -->|2. Fotoğraf/Ses/YouTube Linki Ekle| Cloudinary[Cloudinary Yükleme]
    Configurator -->|3. Sipariş Oluştur| Firestore[(Firebase Firestore)]
    
    Admin([Yönetici]) -->|4. Siparişleri Yönetir /admin| AdminPanel[Yönetici Paneli]
    AdminPanel -->|5. PDF Baskı Tetikler| Puppeteer[Puppeteer & Chromium]
    Puppeteer -->|6. Tokenlı Sayfayı Fotoğraflar| PrintRoute[/print/journal/[slug]/[page]]
    PrintRoute -->|7. Canvas Çizimi| Astronomy
    Puppeteer -->|8. PDF Yükler| Storage[(Firebase Storage - Özel)]
    AdminPanel -->|9. Güvenli Signed URL ile PDF İndir| Admin
```

---

## 🌟 Öne Çıkan Özellikler

### 1. Dijital Zaman Kapsülü (`/s/[slug]`)
* **Sinematik Kaydırma Deneyimi:** Tam ekran sahnelerden oluşan, scroll hareketiyle bulanıklıktan netliğe kavuşan gökyüzü madalyonu.
* **Yıldız Anahtarı:** Gökyüzündeki yıldızları ve gezegenleri parlaklık sırasına göre numaralandıran ve gerçek isimleriyle eşleştiren özgün astronomik gösterge tablosu.
* **Yaşayan Zaman Tüneli:** Sayfa sahibinin her 6 ayda bir yeni anılar, fotoğraflar ve mesajlar ekleyerek büyütebildiği dijital zaman çizgisi.
* **Arka Plan Müziği:** YouTube videolarından veya doğrudan ses dosyalarından beslenen, ziyaretçiyi o anın duygusuna ortak eden ses oynatıcısı.

### 2. Fiziksel Deri Defter (`/urun/defter`)
* **Özel Tasarım Temaları:** "Modern Gece + Altın", "Sıcak Gece + Bakır" ve "Mürdüm Gece + Gül Altını" olmak üzere seçilen gökyüzü rengiyle otomatik eşleşen 3 lüks tema.
* **26 Sayfa Yüksek Kaliteli İçerik:** Kapak, mücevher kesim yıldız haritası sayfaları, QR kodları, kişisel anı sayfaları ve boş yazım sayfaları.
* **Mühürlü Gelecek Mektubu:** Defterin arkasında yer alan, belirlenen açılış tarihine kadar saklanması gereken fiziksel mühürlü mektup eki.

### 3. Yönetici Paneli (`/admin`)
* **İnteraktif Sipariş Yönetimi:** Müşteri adı, sipariş numarası veya e-postaya göre anlık arama. Sipariş durumlarına ve ürün tiplerine göre sekmeli filtreleme.
* **Canlı Sayfa Önizleme:** Sipariş sayfasında yer alan mobil iframe önizlemesi sayesinde sipariş içeriğini anında görebilme.
* **Dinamik Fiyatlandırma:** Tüm ürünlerin liste ve indirimli fiyatlarını doğrudan panel üzerinden yönetebilme yeteneği.

---

## 📂 Klasör Yapısı

```
app/
  admin/                 Sipariş, şablon ve fiyat yönetimi içeren şifreli panel
  api/
    geocode/             Harita arama ve saat dilimi proxy'si
    upload/sign/         İmzalı Cloudinary yüklemeleri için geçici imza servisi
  create/                5 Adımlı gökyüzü sihirbazı ve canlı önizleme arayüzü
  s/[slug]/              Paylaşılabilir dijital zaman kapsülü sayfası
  urun/                  Ürün tanıtım ve vitrin sayfaları (defter & dijital)
  print/journal/...      Puppeteer'ın baskı amacıyla ziyaret ettiği token korumalı canvas
components/
  astrolab/              Kanvas çizim katmanı ve gökyüzü render bileşenleri
  starmap/               Dijital sayfanın sinematik sahneleri (TitleReveal, Timeline vb.)
  journal/               Deri defter kapak ve iç sayfa görselleştirme araçları
lib/
  astronomy/             computeSky.ts — astronomy-engine tabanlı matematik motoru
  firebase/              Firebase admin istemcisi ve yapılandırma denetimleri
  journalPrintRender.ts  Puppeteer tabanlı 300 DPI baskı alma motoru
```

---

## 🚀 Yerel Geliştirme (Local Development)

### 1. Kurulum ve Çalıştırma

```bash
# Bağımlılıkları yükleyin
npm install

# Çevre değişkenleri dosyasını oluşturun
cp .env.example .env.local

# Projeyi lokalde başlatın
npm run dev
```

> [!NOTE]
> `.env.local` dosyasındaki Firebase kimlik bilgileri boşsa, uygulama veritabanı olmadan yerel şablonlarla (`lib/templates.ts`) fallback modunda çalışacaktır.

### 2. Firebase Kurulumu

Firestore kurallarını ve varsayılan verileri yüklemek için:

```bash
# Firebase CLI üzerinden giriş yapın
firebase login

# Projenizi seçip yapılandırın
firebase use --add

# Güvenlik kurallarını yükleyin
firebase deploy --only firestore:rules,storage:rules

# Varsayılan şablonları Firestore'a aktarın
npm run seed:firebase
```

### 3. Kullanılan Komutlar

* `npm run dev`: Geliştirme sunucusunu başlatır (`localhost:3000`).
* `npm run build`: Production için Next.js çıktısı üretir.
* `npx tsc --noEmit`: Projedeki TypeScript tip kontrolünü çalıştırır.
* `npm run lint`: ESLint kontrollerini yapar.

---

## 🔒 Güvenlik Politikası

> [!IMPORTANT]
> 300 DPI baskı kalitesindeki PDF dosyaları **kesinlikle genel erişime açık bir Storage URL'i üzerinden paylaşılmaz**.
> Bu dosyalara erişim, yalnızca yetkilendirilmiş admin oturumuna sahip kullanıcılar tarafından, sunucu tarafında üretilen 5 dakikalık geçici imzalı URL'ler (`signed URL`) aracılığıyla sağlanır. Güvenlik kuralları `storage.rules` dosyasından yönetilmektedir.
