# Proje Durumu — 16 Temmuz 2026

Bu dosya, Astrifer projesinin **güncel durumunu, son yapılan geliştirmeleri ve bekleyen işleri** takip etmek için kullanılır. Yapısal/kalıcı bilgiler için `CLAUDE.md` dosyasına bakabilirsiniz.

---

## Son Yapılan Değişiklikler (Commit Edilecekler)

Bugünkü çalışma oturumunda, hem yönetici paneli kullanıcı deneyimini iyileştirmek hem de müşteri arayüzünü daha canlı ve dinamik hale getirmek amacıyla kapsamlı geliştirmeler yapılmıştır:

### 1. İnteraktif Admin Sipariş Yönetimi (`OrdersManager`)
* **Anlık Arama & Filtreleme:** Siparişlerin listelendiği sayfa, istemci tarafında anlık arama yapabilen `OrdersManager.tsx` bileşenine dönüştürüldü. Müşteri adı, e-posta, sipariş no veya dijital sayfa slug'ı ile saniyeler içinde arama yapılabiliyor.
* **Durum & Ürün Sekmeleri:** Siparişler durumlarına (Ödeme Bekliyor, Ödendi, Üretimde, Kargolandı vb.) ve ürün tiplerine (Dijital Sayfa, Deri Defter, Paket) göre sekmeler halinde anında filtrelenebiliyor.
* **Detaylı Sipariş Görünümü (`orders/[id]`):** Sipariş detay sayfasında artık siparişe dahil olan her bir ürün kalemi (item) fiyatıyla listeleniyor. Ayrıca müşterinin defter için yazdığı Gelecek Mektubu metni ve mektubun açılış tarihi doğrudan gösteriliyor.
* **Canlı Dijital Sayfa Önizlemesi:** Sipariş detay sayfasına, ilgili dijital sayfanın (`/s/[slug]`) mobil formatta çalışan canlı bir önizleme `iframe`'i entegre edildi. Admin, sayfayı açmadan içeriği görebiliyor.
* **Güvenli PDF İndirme Butonu:** Server action'lar üzerinden tetiklenen PDF indirmelerinde tarayıcı yönlendirme sorunlarını önlemek amacıyla yeni bir `DownloadPdfButton.tsx` bileşeni yazıldı.

### 2. Dinamik Fiyat ve İndirim Yönetimi
* **Çift Fiyat Altyapısı:** Fiyatlandırma tablosuna (`config/pricing` dokümanı) her ürün için hem normal satış fiyatı (price) hem de indirim öncesi liste fiyatı (original price) alanları eklendi.
* **İndirim Yönetim Paneli:** `/admin/pricing` adresindeki panel, bu çift fiyat yapısını destekleyecek şekilde güncellendi.
* **Yüzdesel İndirim Rozetleri:** `/create` sihirbazında, ana sayfadaki `ProductsTeaser` alanında ve defter detaylarında indirim oranları otomatik hesaplanarak şık yeşil indirim rozetleri (`%30 İNDİRİM` vb.) ile gösterilmesi sağlandı.

### 3. Ürün ve Tanıtım Sayfalarının Yenilenmesi
* **ProductsTeaser (`components/home/ProductsTeaser.tsx`):** Ana sayfadaki ürün kartları, tab geçişli ve Framer Motion destekli interaktif bir arayüzle yeniden tasarlandı. Müşteriler dijital sayfa ile deri defter arasında pürüzsüzce geçiş yapıp özellikleri ve dinamik fiyatları görebiliyor.
* **Dijital Sayfa Tanıtım Sayfası (`DigitalProductClient.tsx`):** `/urun/dijital` sayfası Server Component yapılıp dinamik fiyatları Firestore'dan okuyacak hale getirildi. Görsel detaylar ise interaktif gökyüzü haritası, 6 benzersiz renk paleti (Kehribar, Gül Şafağı, Gece Laciverti, Kozmik Aurora, Kızıl Bulut, Derin Mor) ve fotoğraf zaman tüneli demolarıyla zenginleştirilen bir client bileşenine taşındı.

### 4. Sihirbaz (Wizard) Geliştirmeleri & YouTube Entegrasyonu (`CreateForm.tsx`)
* **Adım Koruma Mantığı:** Kullanıcının `/create` üzerinde kaldığı adım (`step` ve en uzak ulaştığı adım olan `furthestStep`) URL parametrelerine ve Firestore taslak verisine entegre edildi. Önizlemeden geri dönüldüğünde kullanıcı kaldığı adımdan devam edebiliyor.
* **YouTube Müzik Entegrasyonu:** Arka plan müzikleri için YouTube linki girildiğinde mp3 dönüştürme aşaması kaldırıldı. YouTube Iframe Player API kullanılarak müzik doğrudan arka planda YouTube üzerinden çalınacak şekilde `MusicContext.tsx` güncellendi. Form içinde de YouTube müziği için şık bir önizleme oynatıcısı sunuldu.
* **Defter Sayfa Dizilimi:** Sayfa sıralamasındaki blank sayfa dizilimleri düzeltildi. QR kodlu sayfa arka kapak öncesine (11. sayfa konumuna) taşındı.
### 5. Bulut Depolama (Cloudflare R2) Göçü & Güvenlik
* **Cloudflare R2 Migrasyonu:** AWS S3 SDK entegrasyonu tamamlandı. Firebase/GCS Storage kütüphanesi yerine `lib/r2.ts` yardımıyla tüm fotoğraf yüklemeleri ve presigned PDF baskı linkleri Cloudflare R2'ye taşındı.
* **Yönetici Şifre Güvenliği:** Yönetici paneli şifresi üretim ortamı için güvenli bir değere (`22932293Me.`) güncellendi.

### 6. Yıldız Haritası Parlaklık & Belirginlik İyileştirmeleri
* **Yıldız Netleştirme:** Yıldızların etrafındaki aşırı bulanıklığa (blur) sebep olan parıldama haleleri (`glow`) ve yarıçap değerleri optimize edildi. Yıldızlar artık keskin, net dairesel noktalar halinde parıldıyor.
* **Filigran Okunabilirliği:** Mobil görünümlerde "GEÇİCİ ÖNİZLEME" yazısı ve kilit ikonunun mikroskobik boyutlara küçülmesini engellemek için minimum sınırlar getirilip opaklık artırıldı.

### 7. Anasayfa Tasarım Redesign & Yasal Sözleşmeler
* **Yeni Cam Kart Tasarımları (Gece Camı & Kehribar Yaldız):** "Ne İnşa Ediyoruz", "Nasıl Çalışır" ve "FAQ" bölümleri, ince altın kontur parıltılarına sahip lüks glassmorphic kartlara dönüştürüldü.
* **Yörünge Çizgisi Akışı:** "Nasıl Çalışır" bölümünün arkasına masaüstünde adımları bağlayan estetik bir gökyüzü yörünge çizgisi yerleştirildi.
* **Dynamic Yasal Sayfalar:** KVKK, Kullanım Koşulları, Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu yasal metinleri için `/sozlesmeler/[slug]` dinamik rotası oluşturuldu ve Footer'a linklendi.
* **Ödeme Onay Kutuları:** Ödeme formunun sonuna zorunlu sözleşme onay checkbox'ları entegre edildi.

### 8. Tasarım Düzeltmeleri, Video Yükleme/Kayıt ve Fiyat Kampanyası Entegrasyonu
* **Önizleme Buton Kayması Düzeltildi:** Önizleme butonunun `a` etiketinin varsayılan `inline` stili `block` olarak güncellendi ve sepet butonuyla üst üste binme sorunu giderildi.
* **Gravür Filigranı Netleştirildi:** Açık renkli Gravür temasında okunmayan beyaz filigran yerine, koyu kahverengi mürekkep tonlarında (`#241F19`) ve dengeli opaklıkta çalışan `.watermark-overlay.watermark-gravur` sınıfı entegre edildi.
* **20 Saniyelik Video Yükleme ve Kayıt:** Dosya seçerek ya da tarayıcı kamerasından sesli video kaydedilmesini sağlayan `VideoPicker` bileşeni oluşturuldu. 20 saniye sınırı ve sayaç eklendi. Cloudinary ve cam tasarımlı HTML5 video oynatıcısı kullanıcı arayüzüne ve yönetici paneline eklendi.
* **Defter Alana Dijital Sayfa Bedava:** Sepette aynı slug ile Deri Defter ve Dijital Sayfa bulunduğunda, dijital sayfa fiyatı 0 TL'ye (Bedava) indirilip asıl fiyatının üzeri çizilerek sepet, ödeme ve Firestore sipariş toplamı güncellendi.
* **Düğün Şablonu & Zengin Notlar:** Yeni Düğün şablonu eklendi ve tüm kategorilerin hazır not listeleri 6'şar adet romantik/duygusal mesajla zenginleştirildi.
### 9. 3D Gök Küresi Odaklı Arayüz, Groq AI Entegrasyonu, SVG İkon Geçişi ve Yıldız Tozu Efekti
* **Sadece 3D Gök Küresi Madalyonu:** 2D Harita madalyonu, 2D/3D geçiş butonları ve 2D döndürme butonları kaldırıldı. Madalyon ve Gravür kutularında varsayılan olarak interaktif, döndürülebilir 3D Gök Küresi (`CelestialGlobe3D`) yerleştirildi. Büyüteç butonuna basıldığında açılan tam ekran modalda da 3D Küre render edilmektedir.
* **Groq Llama 3.1 AI Mektup Entegrasyonu:** AI mektup üretici API endpoint'i güncellenerek Groq altyapısına bağlandı. Son derece hızlı ve akıcı Türkçe yanıtlar üreten `llama-3.1-8b-instant` modeli entegre edildi.
* **SVG İkon Modernizasyonu:** Tüm sayfalarda yer alan emojiler (sürükleme, kozmik başlıklar, AI butonları ve video kaydedici butonları) temizlenerek platformun minimalist tasarım çizgisine uygun lüks SVG vektör ikonlarla değiştirildi.
* **Yıldız Tozu İmleç Efekti (`CosmicCursorTrail`):** Kullanıcı fareyi hareket ettirdikçe veya ekrana dokundukça süzülen, yavaşça sönen yıldız tozu parçacıkları efekti yazıldı ve yalnızca modern kozmik temalı sayfalarda aktif olacak şekilde entegre edildi.

---

## Bilinen Eksikler ve Yapılacaklar (TODO)

### Öncelikli Altyapı
- **[ ] Ödeme (iyzico/PayTR) Entegrasyonu:** `/checkout` sayfası ödeme akışına yönlendirmeye hazır ancak iyzico/PayTR entegrasyon API'leri üretim ortamında aktif edilmeli.
- **[ ] Domain Satın Alımı & Ayarları:** `astrifer.net` domain yönlendirmeleri tamamlanıp production deploy ortamındaki `NEXT_PUBLIC_SITE_URL` ayarları yapılmalı.



