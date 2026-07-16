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

---

## Bilinen Eksikler ve Yapılacaklar (TODO)

- **[ ] Ödeme (iyzico) Entegrasyonu:** `/checkout` sayfası sepeti gösteriyor ancak ödeme aşaması henüz kapalı.
- **[ ] Geçici Manuel Sipariş Akışı:** iyzico entegre edilene kadar banka havalesi (IBAN) ve WhatsApp üzerinden manuel sipariş onaylama adımlarının koda dökülmesi gerekiyor. Sipariş durumu `"ödeme bekleniyor"` olarak Firestore'a kaydedilmeli ve kullanıcıya banka bilgileri gösterilmeli.
- **[ ] Firebase Storage Bucket Ayarı:** `.env.local` dosyasındaki `FIREBASE_STORAGE_BUCKET` alanı hâlâ boş. Bu alan doldurulmalı, aksi halde PDF baskı üretimi sırasında hata alınabilir.
- **[ ] Domain Satın Alımı & Ayarları:** `astrifer.com` / `astrifer.net` domain yönlendirmeleri ve production deploy ortamındaki `NEXT_PUBLIC_SITE_URL` ayarları yapılmalı.
- **[ ] Admin Güvenliği:** `.env.local` içinde test amacıyla `ADMIN_PASSWORD=0000` kullanılıyor. Canlıya geçmeden önce bu şifre güçlü bir değerle değiştirilmeli.
