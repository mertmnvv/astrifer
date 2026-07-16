import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SectionHeading } from "@/components/atlas/SectionHeading";
import { AtlasPanel } from "@/components/atlas/AtlasPanel";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { slug: "kvkk" },
    { slug: "kullanim-kosullari" },
    { slug: "mesafeli-satis" },
    { slug: "on-bilgilendirme" },
  ];
}

interface SozlesmeData {
  title: string;
  eyebrow: string;
  lastUpdated: string;
  contentHtml: string;
}

const SOZLESME_CONTENTS: Record<string, SozlesmeData> = {
  kvkk: {
    eyebrow: "Yasal Bilgilendirme",
    title: "KVKK Aydınlatma Metni",
    lastUpdated: "16 Temmuz 2026",
    contentHtml: `
      <h3>1. Veri Sorumlusu</h3>
      <p>Astrifer olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, veri sorumlusu sıfatıyla kişisel verilerinizi aşağıda açıklanan amaçlar ve sınırlar çerçevesinde işlemekteyiz.</p>

      <h3>2. İşlenen Kişisel Verileriniz ve Toplanma Yöntemi</h3>
      <p>Sipariş işlemleri, kişiselleştirilmiş yıldız haritası oluşturulması ve teslimat süreçlerinin yürütülmesi amacıyla aşağıdaki verileriniz tamamen veya kısmen otomatik yollarla toplanmaktadır:</p>
      <ul>
        <li><strong>Kimlik ve İletişim Bilgileri:</strong> Ad soyad, e-posta adresi, telefon numarası.</li>
        <li><strong>Sipariş ve Teslimat Bilgileri:</strong> Teslimat adresi, fatura bilgileri, sipariş içeriği.</li>
        <li><strong>Kapsül İçeriği (Özel Nitelikli / Kişisel Veri):</strong> Yıldız haritasına eklediğiniz fotoğraflar, ses kayıtları ve kişisel notlar/metinler.</li>
      </ul>

      <h3>3. Kişisel Verilerin İşlenme Amaçları</h3>
      <p>Kişisel verileriniz, kanunun 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları dahilinde şu amaçlarla işlenir:</p>
      <ul>
        <li>Kişiselleştirilmiş yıldız haritası (Dijital Sayfa ve Deri Defter) ürünlerinin hazırlanması, basılması ve fiziki kargo süreçlerinin yürütülmesi,</li>
        <li>Sesli kayıtların barındırılması ve QR kod entegrasyonu ile dinlenebilir kılınması,</li>
        <li>Ödeme süreçlerinin PayTR entegrasyonu üzerinden güvenli şekilde tamamlanması,</li>
        <li>Talep, şikayet ve satış sonrası destek hizmetlerinin yürütülmesi.</li>
      </ul>

      <h3>4. İşlenen Verilerin Aktarılması</h3>
      <p>Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda ve KVKK standartlarına uygun olarak yalnızca şu alıcılara aktarılmaktadır:</p>
      <ul>
        <li>Fiziksel ürünlerin gönderimi amacıyla anlaşmalı kargo şirketlerine (teslimat adresi ve alıcı ismi),</li>
        <li>Güvenli ödemenin alınması amacıyla lisanslı ödeme kuruluşu olan PayTR'ye,</li>
        <li>Bulut depolama ve web barındırma hizmetlerinin yürütülmesi amacıyla kullandığımız Cloudflare R2 altyapı hizmeti sağlayıcılarına (yüklenen fotoğraf ve ses dosyaları şifrelenmiş olarak barındırılır).</li>
      </ul>

      <h3>5. Veri Sahibinin Hakları (Madde 11)</h3>
      <p>KVKK'nın 11. maddesi kapsamında, bize başvurarak kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme ve verilerinizin silinmesini veya düzeltilmesini isteme haklarına sahipsiniz. Taleplerinizi <strong>destek@astrifer.net</strong> adresine iletebilirsiniz.</p>
    `,
  },
  "kullanim-kosullari": {
    eyebrow: "Kullanım Koşulları",
    title: "Üyelik ve Kullanım Koşulları",
    lastUpdated: "16 Temmuz 2026",
    contentHtml: `
      <h3>1. Taraflar</h3>
      <p>İşbu Kullanım Koşulları, astrifer.net internet sitesine ("Site") erişim sağlayan ve Site üzerinden alışveriş yapan tüm kullanıcılar ("Kullanıcı") ile Site'nin sahibi ve yöneticisi olan Astrifer ("Şirket") arasında akdedilmiştir.</p>

      <h3>2. Hizmetin Tanımı</h3>
      <p>Şirket, Site üzerinden kullanıcıların girdikleri astronomik parametrelere (tarih, saat, konum) göre kişiselleştirilmiş dijital yıldız haritası oluşturmalarına, bu haritaya medya (fotoğraf, ses kaydı) yüklemelerine ve ilgili haritanın basılı olduğu Deri Defter ürününü sipariş etmelerine olanak tanıyan bir e-ticaret platformu sunmaktadır.</p>

      <h3>3. Fikri Mülkiyet Hakları</h3>
      <p>Site'nin arayüzü, kullanılan özgün kodlar, grafik tasarımları, markalar, logolar ve "Astrifer" adı altındaki tüm tescilli fikri mülkiyet hakları Şirket'e aittir. Kullanıcı, Site içeriğini kopyalayamaz, çoğaltamaz veya izinsiz ticari amaçla kullanamaz.</p>

      <h3>4. Yükümlülükler ve İçerik Kuralları</h3>
      <p>Kullanıcı, zaman kapsüllerine yüklediği fotoğrafların, metinlerin ve ses kayıtlarının yasalara, ahlaka ve üçüncü kişilerin fikri mülkiyet/kişilik haklarına uygun olduğunu taahhüt eder. Yasa dışı veya telif hakkı ihlali barındıran içeriklerden tamamen Kullanıcı sorumludur.</p>

      <h3>5. Değişiklikler</h3>
      <p>Şirket, işbu sözleşmeyi ve Site üzerindeki ürün/fiyat politikalarını dilediği zaman güncelleme hakkını saklı tutar. Güncellemeler Site'de yayınlandığı tarihte yürürlüğe girer.</p>
    `,
  },
  "mesafeli-satis": {
    eyebrow: "E-Ticaret Sözleşmesi",
    title: "Mesafeli Satış Sözleşmesi",
    lastUpdated: "16 Temmuz 2026",
    contentHtml: `
      <h3>1. Taraflar</h3>
      <p><strong>Satıcı:</strong> Astrifer (E-Posta: destek@astrifer.net)<br />
      <strong>Alıcı:</strong> astrifer.net üzerinden sipariş formunu doldurarak ödeme yapan kullanıcı.</p>

      <h3>2. Sözleşmenin Konusu</h3>
      <p>İşbu sözleşmenin konusu, Alıcı'nın Satıcı'ya ait astrifer.net internet sitesinden elektronik ortamda siparişini yaptığı, nitelikleri ve satış fiyatı Site'de belirtilen kişiselleştirilmiş dijital ve fiziksel ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>

      <h3>3. Ürün Özellikleri ve Cayma Hakkı İstisnası</h3>
      <p>Sözleşme konusu ürünler (Dijital Zaman Kapsülü Sayfası ve kişiye özel isim/tarih/koordinat basılı Deri Defter), Alıcı'nın özel istek ve talepleri doğrultusunda hazırlanan, şahsa özel nitelikteki mallardır.</p>
      <p><strong>ÖNEMLİ HUKUKİ BİLGİLENDİRME (Cayma Hakkı Muafiyeti):</strong> Mesafeli Sözleşmeler Yönetmeliği'nin "Cayma Hakkının İstisnaları" başlıklı 15. maddesinin 1. fıkrasının (b) bendi uyarınca; <em>"Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmelerde"</em> tüketicinin cayma hakkı bulunmamaktadır. Dolayısıyla, siparişi onaylanan kişiselleştirilmiş ürünlerde (dijital harita ve defter) <strong>üretim/hazırlık süreci başladıktan sonra iptal, iade veya cayma hakkı kullanılamaz.</strong></p>

      <h3>4. Teslimat ve Kargo</h3>
      <p>Fiziksel Deri Defter siparişleri, ödemenin başarıyla alınmasından itibaren 5-7 iş günü içerisinde Alıcı'nın belirtmiş olduğu adrese gönderilmek üzere kargoya verilir. Kargo firmalarından kaynaklanan gecikmelerden Satıcı sorumlu tutulamaz.</p>
    `,
  },
  "on-bilgilendirme": {
    eyebrow: "Sipariş Öncesi Bilgilendirme",
    title: "Ön Bilgilendirme Formu",
    lastUpdated: "16 Temmuz 2026",
    contentHtml: `
      <h3>1. Satıcı Bilgileri</h3>
      <p><strong>Ad/Unvan:</strong> Astrifer<br />
      <strong>E-Posta:</strong> destek@astrifer.net<br />
      <strong>Hizmet Sunulan Web Adresi:</strong> astrifer.net</p>

      <h3>2. Sözleşme Konusu Ürünler ve Ödeme</h3>
      <p>Alıcı'nın sepetine eklediği, tarih, saat, konum, fotoğraf ve ses dosyalarıyla özelleştirdiği dijital veya basılı (Deri Defter) ürünlerdir. Toplam ürün bedeli, vergiler ve varsa kargo ücreti ödeme ekranında Alıcı'ya gösterildiği şekildedir.</p>

      <h3>3. Cayma Hakkı Bilgilendirmesi</h3>
      <p>Alıcı, siparişini verdiği ürünlerin tamamen kendi istekleri doğrultusunda (özel tarih, adlar, kişisel notlar, yüklenen medya dosyaları vb.) üretildiğini bildiğini kabul eder. Tüketici mevzuatı gereği, bu tarz kişiselleştirilmiş ürünlerde cayma hakkı (iade hakkı) bulunmamaktadır.</p>

      <h3>4. İtiraz ve Şikayet Mercileri</h3>
      <p>Alıcı, şikayet ve itirazları konusundaki başvurularını, Gümrük ve Ticaret Bakanlığı tarafından belirlenen parasal sınırlar dahilinde Alıcı'nın mal veya hizmeti satın aldığı veya ikametgahının bulunduğu yerdeki Tüketici Hakem Heyetine veya Tüketici Mahkemesine yapabilir.</p>
    `,
  },
};

export default function SozlesmePage({ params }: { params: { slug: string } }) {
  const data = SOZLESME_CONTENTS[params.slug];
  if (!data) notFound();

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-4 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-36 bg-void text-left">
        <div className="mx-auto max-w-3xl">
          {/* Back link */}
          <div className="mb-8">
            <Link
              href="/"
              className="font-mono text-[10px] uppercase tracking-widest text-amber hover:text-bright transition-colors"
            >
              ← Anasayfaya Dön
            </Link>
          </div>

          <SectionHeading eyebrow={data.eyebrow} title={data.title} align="left" />
          
          <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-dim">
            Son Güncelleme: {data.lastUpdated}
          </p>

          <AtlasPanel padding="lg" className="mt-8 border-amber/15 bg-void/50 shadow-2xl">
            <div 
              className="prose prose-invert max-w-none text-subtle text-sm leading-relaxed space-y-6"
              style={{
                fontFamily: 'inherit'
              }}
              dangerouslySetInnerHTML={{ __html: data.contentHtml }}
            />
          </AtlasPanel>
          
          {/* Custom style to format legal tags inside prose nicely */}
          <style dangerouslySetInnerHTML={{ __html: `
            .prose h3 {
              color: var(--color-bright, #fffaf0);
              font-family: var(--font-display, serif);
              font-style: italic;
              font-size: 1.15rem;
              margin-top: 1.5rem;
              margin-bottom: 0.5rem;
              border-bottom: 1px solid rgba(230, 163, 92, 0.15);
              padding-bottom: 0.25rem;
            }
            .prose ul {
              list-style-type: square;
              padding-left: 1.25rem;
              margin-top: 0.5rem;
              margin-bottom: 0.5rem;
            }
            .prose li {
              margin-bottom: 0.25rem;
            }
            .prose strong {
              color: var(--color-amber, #e8c974);
            }
          `}} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
