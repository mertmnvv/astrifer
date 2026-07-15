import Link from "next/link";
import { notFound } from "next/navigation";
import { JournalBookPreview } from "@/components/admin/JournalBookPreview";
import { getDb } from "@/lib/firebase/admin";
import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import { formatTRY } from "@/lib/pricing";
import { getStarMapBySlug } from "@/lib/starmaps";
import type { OrderDoc } from "@/types/firestore";
import {
  getJournalPrintPdfDownloadUrlAction,
  getLetterInsertDownloadUrlAction,
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
  "rounded-full border border-text/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-subtle transition-colors hover:border-amber/50 hover:text-amber disabled:cursor-not-allowed disabled:opacity-40";
const DOWNLOAD_BUTTON_CLASS =
  "rounded-full border border-amber/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-amber transition-colors hover:bg-amber hover:text-ink";

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
  const journalStarMap = showJournal ? await getStarMapBySlug(journalSlug) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="font-mono text-xs uppercase tracking-widest text-subtle hover:text-amber">
          ← Siparişler
        </Link>
      </div>

      <h1 className="font-display text-2xl italic text-bright">
        {order.orderNumber ? `Sipariş ${order.orderNumber}` : `Sipariş #${order.id}`}
      </h1>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <div className="space-y-6">
          {/* ── Sipariş bilgileri ── */}
          <div className="rounded-2xl border border-text/10 bg-text/[0.035] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Sipariş Defteri</p>
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

          {/* ── Ürün kalemleri ── */}
          {order.items && order.items.length > 0 && (
            <div className="rounded-2xl border border-text/10 bg-text/[0.035] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Ürün Kalemleri</p>
              <div className="mt-2 divide-y divide-text/[0.08]">
                {order.items.map((item, index) => (
                  <div key={index} className="py-3">
                    <div className="flex justify-between gap-4">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-dim">
                        {item.label}
                      </span>
                      <span className="text-right font-mono text-sm text-amber">
                        {formatTRY(item.price)}
                      </span>
                    </div>
                    {item.journalLetterText && (
                      <p className="mt-1 text-xs text-subtle">
                        Gelecek Mektubu: {item.journalLetterText.slice(0, 80)}
                        {item.journalLetterText.length > 80 ? "…" : ""}
                      </p>
                    )}
                    {item.journalLetterOpeningDate && (
                      <p className="mt-0.5 text-xs text-subtle">
                        Açılış tarihi: {item.journalLetterOpeningDate}
                      </p>
                    )}
                  </div>
                ))}
                <div className="flex justify-between gap-4 pt-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-dim">Toplam</span>
                  <span className="font-display text-lg italic text-amber">
                    {formatTRY(order.totalAmount ?? order.priceAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Durum güncelleme ── */}
          <div className="rounded-2xl border border-text/10 bg-text/[0.035] p-5">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Durum</p>
            <form action={updateOrderAction} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="orderId" value={order.id} />
              <select
                name="status"
                defaultValue={order.status}
                className="rounded-md border border-text/[0.14] bg-text/[0.04] px-2 py-1 text-xs text-text"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status} className="bg-panel text-text">
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="trackingNumber"
                defaultValue={order.trackingNumber ?? ""}
                placeholder="Takip no"
                className="w-28 rounded-md border border-text/[0.14] bg-text/[0.04] px-2 py-1 text-xs text-text placeholder:text-subtle"
              />
              <button
                type="submit"
                className="rounded-full border border-amber/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-amber transition-colors hover:bg-amber hover:text-ink"
              >
                Kaydet
              </button>
            </form>
          </div>
        </div>

        {/* ── Üretim ── */}
        <div className="space-y-6">
          {showDigital && (
            <div className="rounded-2xl border border-text/10 bg-text/[0.035] p-5">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Dijital Sayfa</p>
              <div className="space-y-3">
                <div className="aspect-[9/16] w-full max-w-sm overflow-hidden rounded-md border border-text/10 shadow-xl shadow-black/50">
                  <iframe
                    src={`/s/${digitalSlug}`}
                    title="Dijital Sayfa önizleme"
                    sandbox="allow-scripts allow-same-origin"
                    className="h-full w-full"
                  />
                </div>
                <Link
                  href={`/s/${digitalSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block font-mono text-[10px] uppercase tracking-widest text-amber underline underline-offset-2 hover:text-bright"
                >
                  Yeni sekmede aç
                </Link>
              </div>
            </div>
          )}

          {showJournal && (
            <div className="rounded-2xl border border-text/10 bg-text/[0.035] p-5">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Deri Defter — Üretim</p>

              {!journalStarMap ? (
                <p className="text-sm text-subtle">Bu siparişe ait harita verisi bulunamadı.</p>
              ) : (
                <JournalBookPreview starMap={journalStarMap} />
              )}

              <div className="mt-6 grid gap-6 border-t border-text/10 pt-5 sm:grid-cols-2">
                <div className="flex flex-col items-start gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-dim">
                    Baskıya Hazır PDF — 26 sayfa, 300 DPI
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
                    <form action={getJournalPrintPdfDownloadUrlAction}>
                      <input type="hidden" name="orderId" value={order.id} />
                      <button type="submit" className={DOWNLOAD_BUTTON_CLASS}>
                        PDF İndir (Baskıya Hazır)
                      </button>
                    </form>
                  ) : (
                    <p className="text-xs text-dim">Henüz baskıya hazır PDF üretilmedi.</p>
                  )}
                </div>

                <div className="flex flex-col items-start gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-dim">
                    Gelecek Mektubu — mühürlü ek (PDF)
                  </p>
                  <form action={renderLetterInsertAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <button type="submit" disabled={!order.journalLetterText} className={ACTION_BUTTON_CLASS}>
                      {order.letterInsertPrintPath ? "Yeniden Oluştur" : "Mektup Ekini Oluştur"}
                    </button>
                  </form>
                  {order.letterInsertPrintPath ? (
                    <form action={getLetterInsertDownloadUrlAction}>
                      <input type="hidden" name="orderId" value={order.id} />
                      <button type="submit" className={DOWNLOAD_BUTTON_CLASS}>
                        PDF İndir
                      </button>
                    </form>
                  ) : (
                    <p className="text-xs text-dim">Henüz mektup eki üretilmedi.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
