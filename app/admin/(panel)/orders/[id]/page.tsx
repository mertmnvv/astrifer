import Link from "next/link";
import { notFound } from "next/navigation";
import { JournalBookPreview } from "@/components/admin/JournalBookPreview";
import { cloudinaryTransform } from "@/lib/cloudinary/transformUrl";
import { getDb } from "@/lib/firebase/admin";
import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import { formatTRY } from "@/lib/pricing";
import { getStarMapBySlug } from "@/lib/starmaps";
import type { OrderDoc } from "@/types/firestore";
import { DownloadPdfButton } from "@/components/admin/DownloadPdfButton";
import { DeleteOrderButton } from "./DeleteOrderButton";
import {
  renderJournalPrintFilesAction,
  renderLetterInsertAction,
  updateOrderAction,
} from "../actions";
import { PAYMENT_METHOD_LABELS, PRODUCT_LABELS, resolveItemSlug, STATUS_LABELS, STATUS_OPTIONS } from "../shared";

export const dynamic = "force-dynamic";

function LedgerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="font-mono text-[11px] uppercase tracking-widest text-dim">{label}</dt>
      <dd className="text-right text-sm text-text">{value}</dd>
    </div>
  );
}

function formatDate(timestamp: OrderDoc["createdAt"]): string {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(timestamp.toDate());
}

const ACTION_BUTTON_CLASS =
  "rounded-full border border-text/20 bg-text/[0.02] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-subtle transition-all hover:border-iris hover:text-iris-light disabled:cursor-not-allowed disabled:opacity-40";
const DOWNLOAD_BUTTON_CLASS =
  "rounded-full border border-iris/40 bg-iris/5 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-iris-light transition-all hover:bg-iris hover:text-white";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  if (!isFirebaseConfigured()) {
    return (
      <p className="text-sm text-subtle">
        Firebase yapılandırılmamış — sipariş detayını görmek için <code>.env.local</code> içindeki Admin SDK
        değişkenlerini doldur.
      </p>
    );
  }

  const snapshot = await getDb().collection("orders").doc(params.id).get();
  if (!snapshot.exists) notFound();

  const order = { id: snapshot.id, ...(snapshot.data() as OrderDoc) };
  const showDigital = order.productType === "digital" || order.productType === "bundle";
  const showJournal = order.productType === "journal" || order.productType === "bundle";
  const digitalSlug = resolveItemSlug(order, "digital");
  const journalSlug = resolveItemSlug(order, "journal");

  const starMapSlug = digitalSlug || journalSlug || order.starMapSlug;
  const starMap = starMapSlug ? await getStarMapBySlug(starMapSlug) : null;
  const journalStarMap = showJournal ? (journalSlug === starMapSlug ? starMap : await getStarMapBySlug(journalSlug)) : null;

  const initialEntry = starMap?.entries?.find((entry) => entry.isInitial);
  const photos = initialEntry?.photos ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/orders" className="font-mono text-xs uppercase tracking-widest text-subtle hover:text-iris-light transition-colors">
          ← Siparişler
        </Link>
      </div>

      <h1 className="font-display text-2xl italic text-bright border-b border-text/10 pb-4">
        {order.orderNumber ? `Sipariş ${order.orderNumber}` : `Sipariş #${order.id}`}
      </h1>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <div className="space-y-6">
          {/* ── Sipariş Bilgileri ── */}
          <div className="rounded-2xl border border-text/10 bg-panel p-5 shadow-lg">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Sipariş Bilgileri</p>
            <div className="mt-2 divide-y divide-text/[0.08]">
              {order.orderNumber && <LedgerRow label="Sipariş No" value={order.orderNumber} />}
              <LedgerRow label="Müşteri" value={order.customerName ?? "—"} />
              <LedgerRow label="E-posta" value={order.customerEmail} />
              {order.customerPhone && <LedgerRow label="Telefon" value={order.customerPhone} />}
              <LedgerRow label="Ürün" value={PRODUCT_LABELS[order.productType] ?? order.productType} />
              <LedgerRow label="Tutar" value={formatTRY(order.totalAmount ?? order.priceAmount)} />
              <LedgerRow
                label="Ödeme Yöntemi"
                value={
                  order.paymentMethod
                    ? (PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod)
                    : "—"
                }
              />
              <LedgerRow label="Tarih" value={formatDate(order.createdAt)} />
              {order.trackingNumber && <LedgerRow label="Takip No" value={order.trackingNumber} />}
            </div>
          </div>

          {/* ── Durum Güncelleme ── */}
          <div className="rounded-2xl border border-text/10 bg-panel p-5 shadow-lg">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Sipariş Durumu</p>
            <form action={updateOrderAction} className="flex flex-col gap-3">
              <input type="hidden" name="orderId" value={order.id} />
              <div>
                <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-dim">Durum</label>
                <select
                  name="status"
                  defaultValue={order.status}
                  className="w-full rounded-lg border border-text/15 bg-void px-3 py-2 text-xs text-text focus:border-iris/40 focus:outline-none"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status} className="bg-panel text-text">
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-dim">Takip Numarası</label>
                <input
                  type="text"
                  name="trackingNumber"
                  defaultValue={order.trackingNumber ?? ""}
                  placeholder="Kargo takip no"
                  className="w-full rounded-lg border border-text/15 bg-void px-3 py-2 text-xs text-text placeholder:text-subtle focus:border-iris/40 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-1.5 rounded-full bg-iris text-white py-2.5 font-mono text-xs uppercase tracking-widest font-bold transition-all hover:bg-iris-light shadow-lg"
              >
                Değişiklikleri Kaydet
              </button>
            </form>

            <DeleteOrderButton orderId={order.id} />
          </div>

          {/* ── Müşteri Dosyaları (Fotoğraf/Ses) ── */}
          {starMap && (
            <div className="rounded-2xl border border-text/10 bg-panel p-5 space-y-5 shadow-lg">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim border-b border-text/5 pb-2">Müşteri Dosyaları</p>
              
              {/* Fotoğraflar */}
              <div className="space-y-2">
                <p className="font-mono text-[9px] uppercase tracking-wider text-dim">Yüklenen Fotoğraflar ({photos.length})</p>
                {photos.length === 0 ? (
                  <p className="text-xs text-subtle italic">Fotoğraf yüklenmedi.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {photos.map((photo, idx) => (
                      <div key={idx} className="relative group overflow-hidden rounded-xl border border-text/15 bg-void p-1 flex flex-col">
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-text/5">
                          {photo.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cloudinaryTransform(photo.url, 500)}
                              alt={photo.caption || `Fotoğraf ${idx + 1}`}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-subtle">Görsel yok</div>
                          )}
                        </div>
                        {photo.caption && (
                          <p className="mt-1 px-1 text-center font-display text-[10px] italic text-subtle truncate" title={photo.caption}>
                            &ldquo;{photo.caption}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sesli / Görüntülü Mesaj */}
              <div className="border-t border-text/10 pt-4 space-y-2">
                <p className="font-mono text-[9px] uppercase tracking-wider text-dim">Medya (Ses / Video)</p>
                {starMap.videoUrl ? (
                  <div className="rounded-xl border border-text/10 bg-void p-3 flex flex-col gap-2">
                    <video src={starMap.videoUrl} controls className="w-full max-h-48 rounded-lg bg-black" />
                    <a
                      href={starMap.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-mono text-dim hover:text-iris-light underline self-end"
                    >
                      Videoyu İndir
                    </a>
                  </div>
                ) : starMap.voiceNoteUrl ? (
                  <div className="rounded-xl border border-text/10 bg-void p-3 flex flex-col gap-2">
                    <audio src={starMap.voiceNoteUrl} controls className="w-full h-8 bg-transparent" />
                    <a
                      href={starMap.voiceNoteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-mono text-dim hover:text-iris-light underline self-end"
                    >
                      Ses Dosyasını İndir
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-subtle italic">Medya yüklenmedi.</p>
                )}
              </div>

              {/* Arka Plan Müziği */}
              <div className="border-t border-text/10 pt-4 space-y-2">
                <p className="font-mono text-[9px] uppercase tracking-wider text-dim">Arka Plan Müziği</p>
                {starMap.musicUrl ? (
                  <div className="rounded-xl border border-text/10 bg-void p-3 flex flex-col gap-2">
                    <audio src={starMap.musicUrl} controls className="w-full h-8 bg-transparent" />
                    <a
                      href={starMap.musicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-mono text-dim hover:text-iris-light underline self-end"
                    >
                      Dosyayı İndir
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-subtle italic">Müzik eklenmedi.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Sağ Kolon: Tasarım Detayları, PDF ve Önizleme ── */}
        <div className="space-y-6">
          {/* Tasarım Detayları */}
          {starMap && (
            <div className="rounded-2xl border border-text/10 bg-panel p-5 shadow-lg">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim border-b border-text/5 pb-2">Tasarım Detayları</p>
              <div className="divide-y divide-text/[0.08]">
                <LedgerRow label="Başlık / İsimler" value={starMap.title || "—"} />
                {starMap.message && (
                  <div className="py-3">
                    <dt className="font-mono text-[11px] uppercase tracking-widest text-dim mb-1">Kişisel Mesaj</dt>
                    <dd className="font-display italic text-sm text-bright">&ldquo;{starMap.message}&rdquo;</dd>
                  </div>
                )}
                <LedgerRow label="Konum" value={starMap.locationName} />
                <LedgerRow label="Koordinatlar" value={`${starMap.latitude.toFixed(4)}°, ${starMap.longitude.toFixed(4)}°`} />
                <LedgerRow 
                  label="Tarih & Saat" 
                  value={new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short" }).format(starMap.eventDateUtc)} 
                />
                <LedgerRow label="Renk Paleti" value={starMap.palette || "Varsayılan"} />
                {starMap.journalThemeId && (
                  <LedgerRow label="Defter Teması" value={starMap.journalThemeId} />
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-text/10 flex justify-between items-center">
                <Link
                  href={`/s/${starMap.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[10px] uppercase tracking-widest text-iris-light underline underline-offset-2 hover:text-bright"
                >
                  Dijital Sayfayı Yeni Sekmede Aç ↗
                </Link>
              </div>
            </div>
          )}

          {/* Deri Defter Üretim Bölümü */}
          {showJournal && (
            <div className="rounded-2xl border border-text/10 bg-panel p-5 shadow-lg">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Deri Defter — Üretim</p>

              {!journalStarMap ? (
                <p className="text-sm text-subtle">Bu siparişe ait harita verisi bulunamadı.</p>
              ) : (
                <JournalBookPreview starMap={journalStarMap} />
              )}

              <div className="mt-6 grid gap-6 border-t border-text/10 pt-5 sm:grid-cols-2">
                <div className="flex flex-col items-start gap-3">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-dim">
                    Baskıya Hazır PDF — 27 sayfa, 300 DPI
                  </p>
                  <form action={renderJournalPrintFilesAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <button type="submit" className={ACTION_BUTTON_CLASS}>
                      {order.printPdfPath ? "Yeniden Oluştur" : "PDF Oluştur"}
                    </button>
                  </form>
                  {order.printFileRenderedAt && (
                    <p className="text-xs text-dim">Son oluşturma: {formatDate(order.printFileRenderedAt)}</p>
                  )}
                  {order.printPdfPath ? (
                    <DownloadPdfButton
                      orderId={order.id}
                      type="print"
                      label="PDF İndir (Baskıya Hazır)"
                      className={DOWNLOAD_BUTTON_CLASS}
                    />
                  ) : (
                    <p className="text-xs text-dim">Henüz baskıya hazır PDF üretilmedi.</p>
                  )}
                </div>

                <div className="flex flex-col items-start gap-3">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-dim">
                    Gelecek Mektubu — mühürlü ek (PDF)
                  </p>
                  <form action={renderLetterInsertAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <button type="submit" disabled={!order.journalLetterText} className={ACTION_BUTTON_CLASS}>
                      {order.letterInsertPrintPath ? "Yeniden Oluştur" : "Mektup Ekini Oluştur"}
                    </button>
                  </form>
                  {order.letterInsertPrintPath ? (
                    <DownloadPdfButton
                      orderId={order.id}
                      type="letter"
                      label="PDF İndir"
                      className={DOWNLOAD_BUTTON_CLASS}
                    />
                  ) : (
                    <p className="text-xs text-dim">Henüz mektup eki üretilmedi.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Müşteri Sipariş İçi Ürün Detayları */}
          {order.items && order.items.length > 0 && (
            <div className="rounded-2xl border border-text/10 bg-panel p-5 shadow-lg">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim border-b border-text/5 pb-2">Sipariş Kalemleri ve Mektup</p>
              <div className="divide-y divide-text/[0.08]">
                {order.items.map((item, index) => (
                  <div key={index} className="py-3">
                    <div className="flex justify-between gap-4">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-bright">
                        {item.label}
                      </span>
                      <span className="text-right font-mono text-sm text-iris-light font-semibold">
                        {formatTRY(item.price)}
                      </span>
                    </div>
                    {item.journalLetterText && (
                      <div className="mt-2 rounded-xl border border-text/5 bg-void p-3">
                        <p className="font-mono text-[9px] uppercase tracking-wider text-dim mb-1">Mühürlü Gelecek Mektubu Metni</p>
                        <p className="text-xs text-subtle italic leading-relaxed whitespace-pre-line">
                          &ldquo;{item.journalLetterText}&rdquo;
                        </p>
                      </div>
                    )}
                    {item.journalLetterOpeningDate && (
                      <p className="mt-1.5 text-xs text-dim font-mono">
                        Açılış Tarihi: {item.journalLetterOpeningDate}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Canlı İframe Önizlemesi */}
          {showDigital && (
            <div className="rounded-2xl border border-text/10 bg-panel p-5 shadow-lg">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Canlı Dijital Sayfa Önizlemesi</p>
              <div className="space-y-4">
                <div className="aspect-[9/16] w-full max-w-sm overflow-hidden rounded-xl border border-text/10 shadow-2xl shadow-black/50 mx-auto">
                  <iframe
                    src={`/s/${digitalSlug}`}
                    title="Dijital Sayfa önizleme"
                    sandbox="allow-scripts allow-same-origin"
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
