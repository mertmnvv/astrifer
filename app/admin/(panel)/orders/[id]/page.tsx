import Link from "next/link";
import { notFound } from "next/navigation";
import { StarChart } from "@/components/astrolab/StarChart";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { CoverPanel } from "@/components/journal/CoverPanel";
import { PhotoSlot } from "@/components/journal/PhotoSlot";
import { FrameMockup } from "@/components/ui/FrameMockup";
import { computeSky } from "@/lib/astronomy/computeSky";
import { getDb } from "@/lib/firebase/admin";
import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import { formatTRY, type FrameOption } from "@/lib/pricing";
import { getStarMapBySlug } from "@/lib/starmaps";
import type { OrderDoc } from "@/types/firestore";
import { getPrintDownloadUrlAction, renderPrintFileAction, updateOrderAction } from "../actions";
import { PRINTABLE_PRODUCTS, PRODUCT_LABELS, STATUS_LABELS, STATUS_OPTIONS } from "../shared";

export const dynamic = "force-dynamic";

const PHOTO_ROTATIONS = [-2.5, 2, 1.5, -2];

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
  const starMap = await getStarMapBySlug(order.starMapSlug);
  const sky = starMap
    ? computeSky({ date: starMap.eventDateUtc, latitude: starMap.latitude, longitude: starMap.longitude })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="font-mono text-xs uppercase tracking-widest text-subtle hover:text-amber">
          ← Siparişler
        </Link>
      </div>

      <h1 className="font-display text-2xl italic text-bright">Sipariş #{order.id}</h1>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-text/10 bg-text/[0.035] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Sipariş Defteri</p>
            <div className="mt-2 divide-y divide-text/[0.08]">
              <LedgerRow label="Müşteri" value={order.customerName ?? "—"} />
              <LedgerRow label="E-posta" value={order.customerEmail} />
              <LedgerRow label="Ürün" value={PRODUCT_LABELS[order.productType]} />
              {order.size && <LedgerRow label="Boyut" value={order.size} />}
              {order.frameOption && order.frameOption !== "frameless" && (
                <LedgerRow label="Çerçeve" value={order.frameOption} />
              )}
              <LedgerRow label="Tutar" value={formatTRY(order.priceAmount)} />
              <LedgerRow label="Tarih" value={formatDate(order.createdAt)} />
              {order.trackingNumber && <LedgerRow label="Takip No" value={order.trackingNumber} />}
            </div>
          </div>

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

          <div className="rounded-2xl border border-text/10 bg-text/[0.035] p-5">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Baskı Dosyası</p>
            {PRINTABLE_PRODUCTS.includes(order.productType) && order.size ? (
              <div className="flex flex-col items-start gap-2">
                <form action={renderPrintFileAction}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-text/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-subtle transition-colors hover:border-amber/50 hover:text-amber"
                  >
                    {order.printFilePath ? "Yeniden Oluştur" : "Baskı Dosyası Oluştur"}
                  </button>
                </form>
                {order.printFilePath ? (
                  <form action={getPrintDownloadUrlAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-amber/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-amber transition-colors hover:bg-amber hover:text-ink"
                    >
                      İndirme Linki Al (300 DPI)
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-dim">Henüz baskı dosyası üretilmedi.</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-dim">Bu ürün türü için baskı dosyası üretimi henüz desteklenmiyor.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-text/10 bg-text/[0.035] p-5">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Görsel Önizleme</p>

          {!starMap || !sky ? (
            <p className="text-sm text-subtle">Bu siparişe ait harita verisi bulunamadı.</p>
          ) : order.productType === "digital" ? (
            <div className="space-y-3">
              <div className="aspect-[9/16] w-full max-w-sm overflow-hidden rounded-md border border-text/10 shadow-xl shadow-black/50">
                <iframe
                  src={`/s/${order.starMapSlug}`}
                  title="Dijital Sayfa önizleme"
                  sandbox="allow-scripts allow-same-origin"
                  className="h-full w-full"
                />
              </div>
              <Link
                href={`/s/${order.starMapSlug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block font-mono text-[10px] uppercase tracking-widest text-amber underline underline-offset-2 hover:text-bright"
              >
                Yeni sekmede aç
              </Link>
            </div>
          ) : order.productType === "poster" || order.productType === "framed_poster" ? (
            <div className="w-full max-w-md">
              <FrameMockup frame={(order.frameOption ?? "frameless") as FrameOption} className="w-full">
                <div className="aspect-square w-full">
                  <StarChart
                    sky={sky}
                    label={`${starMap.locationName} önizleme`}
                    className="h-full w-full"
                    palette={getSkyPalette(starMap.palette)}
                  />
                </div>
              </FrameMockup>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="w-full max-w-xs">
                <CoverPanel title={starMap.title} subtitle="Kapak önizleme" />
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-start gap-2 rounded-2xl border border-text/10 bg-text/[0.035] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-dim">
                    Yıldız haritası — iki sayfa birlikte tek gökyüzü
                  </p>
                  <div className="relative aspect-[2/1] w-full overflow-hidden rounded-md shadow-xl shadow-black/50">
                    <StarChart
                      sky={sky}
                      label={`${starMap.locationName} önizleme`}
                      className="h-full w-full"
                      showLabels={false}
                      palette={getSkyPalette(starMap.palette)}
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-1/2 w-12 -translate-x-1/2 bg-gradient-to-r from-black/35 via-transparent to-black/35" />
                    <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/60" />
                  </div>
                </div>
                {starMap.entries.some((entry) => entry.photos.length > 0) && (
                  <div className="flex flex-col items-start gap-2 rounded-2xl border border-text/10 bg-text/[0.035] p-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-dim">Anılar sayfası</p>
                    <div className="grid grid-cols-4 gap-3 p-2">
                      {starMap.entries
                        .flatMap((entry) => entry.photos)
                        .slice(0, 4)
                        .map((photo, index) => (
                          <div key={photo.caption ?? index} className="w-16">
                            <PhotoSlot photo={photo} rotateDeg={PHOTO_ROTATIONS[index % PHOTO_ROTATIONS.length]} />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
