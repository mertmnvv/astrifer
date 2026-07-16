# Astrifer Yol Haritası ve Bekleyen İşler (Roadmap & TODO)

Bu dosya, platforma eklenecek yeni nesil dijital sayfa özelliklerinin entegrasyon adımlarını listelemektedir.

## Yapılacak Özellikler (Roadmap)

- [ ] **3D Celestial Globe (Three.js Gök Küresi)**
  - [ ] `three` ve `@types/three` kütüphanelerinin npm ile projeye dahil edilmesi
  - [ ] `components/starmap/CelestialGlobe3D.tsx` bileşeninin oluşturulması
  - [ ] Yıldız ve takımyıldız koordinat verilerinin 3D küre yüzeyine map edilmesi
  - [ ] Mobil dokunmatik sürükleme ve masaüstü mouse rotasyon kontrollerinin entegre edilmesi
  - [ ] Takımyıldızların parıldama geçişlerinin Three.js render loop'una yazılması
  - [ ] Component unmount durumunda bellek sızıntısını önlemek için `dispose` temizlik fonksiyonlarının eklenmesi

- [ ] **Ambient Audio Visualizer (Müzik Görselleştirici)**
  - [ ] Tarayıcı `AudioContext` ve `AnalyserNode` analizör altyapısının kurulması
  - [ ] YouTube Iframe API ses çıkış kanalı veya HTML5 audio elementlerinin frekans yakalama ayarı
  - [ ] `getByteFrequencyData` verisinin anlık okunarak global state/context'e taşınması
  - [ ] Bas ritimlerinin şiddetine göre gökyüzü nebulalarının ve halelerinin parlaklık genliğinin dinamikleştirilmesi
  - [ ] Tiz tonlara göre takımyıldız bağlantı noktalarında mikro-titreşimlerin tetiklenmesi

- [ ] **AI Memory Narrative (AI Hikaye Asistanı)**
  - [ ] Next.js üzerinde `/api/ai/generate-narrative` endpoint'inin oluşturulması
  - [ ] OpenAI GPT veya Google Gemini API entegrasyonu (romantik ve edebi Türkçe prompts)
  - [ ] Sihirbazın "Kişisel Mesaj" adımına "AI ile Hikaye Yaz/Düzenle" butonunun eklenmesi
  - [ ] Video/Ses kaydı transkriptlerinin AI prompt girdisi olarak API'ye gönderilmesi
  - [ ] Oluşturulan mektup metninin form editörüne doldurulması

- [ ] **Dynamic Day/Night Cycle (Gece/Gündüz Canlı Gökyüzü)**
  - [ ] Ziyaretçi tarayıcısının yerel saat dilimine göre gün dilimi tespiti (Sabah, Gündüz, Akşam, Gece)
  - [ ] 4 farklı gün dilimine uygun lüks kozmik renk geçişlerinin (CSS gradients) tanımlanması
  - [ ] `StarMapView` arka planının gün dilimlerine göre animasyonlu geçiş yapması
  - [ ] Gündüz modunda yıldız haritası parlaklığının azaltılıp metin okunabilirliğinin optimize edilmesi

- [ ] **Cosmic Anniversary Sync (Astronomik Olay Vurgusu)**
  - [ ] Girilen tarihte gökyüzünde gerçekleşen Ay fazı ve önemli astronomik olayların hesaplanması (`lib/astronomy/events.ts`)
  - [ ] Dijital sayfaya o günkü kozmik olayları anlatan şık bir açıklama kutusunun eklenmesi
  - [ ] Gökyüzü haritasında o andaki Ay'ın gerçek hilal/dolunay görselini vektörel olarak yansıtma
  - [ ] Tarihte meteor yağmuru (Perseid, Geminid vb.) varsa gökyüzünde animasyonlu akan yıldız efektlerinin tetiklenmesi
