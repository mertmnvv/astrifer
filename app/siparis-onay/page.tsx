import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SectionHeading } from "@/components/atlas/SectionHeading";
import { AtlasPanel } from "@/components/atlas/AtlasPanel";
import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import { formatTRY } from "@/lib/pricing";
import { getStarMapBySlug, type StarMapRecord, type TimelineEntry, type StarMapPhoto } from "@/lib/starmaps";
import type { OrderDoc } from "@/types/firestore";
import type { Timestamp } from "firebase-admin/firestore";
import { OrderReadyView } from "./OrderReadyView";

export const dynamic = "force-dynamic";

function formatDate(timestamp: Timestamp | string | undefined): string {
  if (!timestamp) return "—";
  const date = typeof timestamp === "object" && typeof (timestamp as unknown as Timestamp).toDate === "function" 
    ? (timestamp as unknown as Timestamp).toDate() 
    : new Date(timestamp as string);
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short" }).format(date);
}

const PRODUCT_LABELS: Record<string, string> = {
  digital: "Dijital Sayfa",
  journal: "Deri Defter",
  bundle: "Dijital Sayfa + Deri Defter",
};

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { id?: string; no?: string };
}) {
  const orderId = searchParams.id;
  const orderNumber = searchParams.no;

  // Try to load the full order from Firestore (shows richer detail)
  let order: (OrderDoc & { id: string }) | null = null;
  let starMap: StarMapRecord | null = null;

  if (orderId && isFirebaseConfigured()) {
    try {
      const { getDb } = await import("@/lib/firebase/admin");
      const snapshot = await getDb().collection("orders").doc(orderId).get();
      if (snapshot.exists) {
        order = { id: snapshot.id, ...(snapshot.data() as OrderDoc) };
        if (order.starMapSlug) {
          starMap = await getStarMapBySlug(order.starMapSlug);
        }
      }
    } catch {
      // Silently fall back to the minimal view
    }
  }

  // If we have both order and starMap, show the rich "Sayfanız Hazır" screen
  if (order && starMap) {
    const serializedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      starMapSlug: order.starMapSlug,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      productType: order.productType,
      priceAmount: order.priceAmount,
      totalAmount: order.totalAmount ?? order.priceAmount,
      currency: order.currency,
      items: order.items.map((item) => ({
        productType: item.productType,
        label: item.label,
        price: item.price,
        starMapSlug: item.starMapSlug,
        journalLetterText: item.journalLetterText ?? null,
        journalLetterOpeningDate: item.journalLetterOpeningDate
          ? (typeof item.journalLetterOpeningDate === "string" 
              ? item.journalLetterOpeningDate 
              : (item.journalLetterOpeningDate as unknown as Timestamp).toDate 
                ? (item.journalLetterOpeningDate as unknown as Timestamp).toDate().toISOString() 
                : new Date(item.journalLetterOpeningDate as string).toISOString())
          : null,
      })),
      status: order.status,
      paymentMethod: order.paymentMethod,
      iyzicoPaymentId: order.iyzicoPaymentId,
      iyzicoConversationId: order.iyzicoConversationId,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      journalLetterText: order.journalLetterText,
      journalLetterOpeningDate: order.journalLetterOpeningDate
        ? ((order.journalLetterOpeningDate as unknown as Timestamp).toDate 
            ? (order.journalLetterOpeningDate as unknown as Timestamp).toDate().toISOString() 
            : new Date(order.journalLetterOpeningDate as unknown as string).toISOString())
        : null,
      printFilePaths: order.printFilePaths,
      printPdfPath: order.printPdfPath,
      printFileRenderedAt: order.printFileRenderedAt,
      letterInsertPrintPath: order.letterInsertPrintPath,
      createdAt: (order.createdAt as unknown as Timestamp).toDate 
        ? (order.createdAt as unknown as Timestamp).toDate().toISOString() 
        : new Date(order.createdAt as unknown as string).toISOString(),
    };

    const serializedStarMap = {
      title: starMap.title,
      message: starMap.message,
      eventDateUtc: starMap.eventDateUtc.toISOString(),
      timezone: starMap.timezone,
      latitude: starMap.latitude,
      longitude: starMap.longitude,
      locationName: starMap.locationName,
      palette: starMap.palette,
      journalThemeId: starMap.journalThemeId ?? null,
      photoUrls: starMap.entries
        .find((e: TimelineEntry) => e.isInitial)?.photos
        .map((p: StarMapPhoto) => p.url)
        .filter((url: string | undefined): url is string => Boolean(url)) ?? [],
      createdAt: starMap.createdAt.toISOString(),
    };

    return (
      <>
        <SiteHeader />
        <main className="min-h-screen px-4 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
          <div className="mx-auto flex max-w-4xl flex-col items-center">
            {/* ── Success icon ── */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-400/60 bg-emerald-400/10">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <SectionHeading
              eyebrow="Sayfanız Hazır"
              title="Siparişinizi Aldık."
              className="mt-6 mb-10"
            />

            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <OrderReadyView order={serializedOrder as any} starMap={serializedStarMap} />
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  // Fallback to simple confirmation page if database data is not fully available
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-4 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <div className="mx-auto flex max-w-xl flex-col items-center">
          {/* ── Success icon ── */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-400/60 bg-emerald-400/10">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <SectionHeading
            eyebrow="Sipariş Alındı"
            title="Teşekkür ederiz!"
            className="mt-6"
          />

          <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-subtle">
            Siparişiniz başarıyla oluşturuldu ve ödemeniz onaylandı.
          </p>

          {/* ── Order details panel ── */}
          <AtlasPanel padding="lg" className="mt-8 w-full">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">
              Sipariş Bilgileri
            </p>
            <div className="mt-4 divide-y divide-text/[0.08]">
              {/* Order number */}
              <div className="flex justify-between gap-4 py-3">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-dim">
                  Sipariş No
                </dt>
                <dd className="text-right font-mono text-sm font-medium text-amber">
                  {order?.orderNumber ?? orderNumber ?? "—"}
                </dd>
              </div>

              {/* Items or product type */}
              {order?.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="flex justify-between gap-4 py-3">
                    <dt className="font-mono text-[11px] uppercase tracking-widest text-dim">
                      {item.label}
                    </dt>
                    <dd className="text-right font-mono text-sm text-text">
                      {formatTRY(item.price)}
                    </dd>
                  </div>
                ))
              ) : order ? (
                <div className="flex justify-between gap-4 py-3">
                  <dt className="font-mono text-[11px] uppercase tracking-widest text-dim">
                    Ürün
                  </dt>
                  <dd className="text-right text-sm text-text">
                    {PRODUCT_LABELS[order.productType] ?? order.productType}
                  </dd>
                </div>
              ) : null}

              {/* Total */}
              {order && (
                <div className="flex justify-between gap-4 py-3">
                  <dt className="font-mono text-xs uppercase tracking-widest text-dim">
                    Toplam
                  </dt>
                  <dd className="text-right font-display text-xl italic text-amber">
                    {formatTRY(order.totalAmount ?? order.priceAmount)}
                  </dd>
                </div>
              )}

              {/* Status */}
              <div className="flex justify-between gap-4 py-3">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-dim">
                  Durum
                </dt>
                <dd className="text-right text-sm text-emerald-400">Ödendi / Onaylandı</dd>
              </div>

              {/* Date */}
              {order && (
                <div className="flex justify-between gap-4 py-3">
                  <dt className="font-mono text-[11px] uppercase tracking-widest text-dim">
                    Sipariş Tarihi
                  </dt>
                  <dd className="text-right text-sm text-text">
                    {formatDate(order.createdAt)}
                  </dd>
                </div>
              )}
            </div>
          </AtlasPanel>

          {/* ── Digital page link ── */}
          {order?.starMapSlug && (
            <Link
              href={`/s/${order.starMapSlug}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber/40 px-6 py-3 font-mono text-xs uppercase tracking-widest text-amber transition-colors hover:bg-amber/10"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                <path d="M10 2a.75.75 0 01.75.75v5.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0L6.2 7.26a.75.75 0 111.1-1.02l1.95 2.1V2.75A.75.75 0 0110 2zM5.273 4.5a1.25 1.25 0 00-1.205.918l-1.523 5.52c-.006.02-.01.041-.015.062H6a1.25 1.25 0 011.176.833l.13.391a.25.25 0 00.236.166h4.916a.25.25 0 00.236-.166l.13-.39A1.25 1.25 0 0114 11h3.47a1.318 1.318 0 00-.015-.062l-1.523-5.52a1.25 1.25 0 00-1.205-.918h-.942a.75.75 0 010-1.5h.942a2.75 2.75 0 012.651 2.019l1.523 5.52c.066.239.099.485.099.732V15a2.75 2.75 0 01-2.75 2.75h-12.5A2.75 2.75 0 011 15v-3.21c0-.246.033-.492.099-.731l1.523-5.52A2.75 2.75 0 015.273 3.5h.942a.75.75 0 010 1.5h-.942z" />
              </svg>
              Dijital Sayfanızı Görüntüleyin
            </Link>
          )}

          {/* ── Back to home ── */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-widest text-subtle underline-offset-4 transition-colors hover:text-amber hover:underline"
            >
              Ana Sayfaya Dön
            </Link>
            <Link
              href="/create"
              className="font-mono text-xs uppercase tracking-widest text-subtle underline-offset-4 transition-colors hover:text-amber hover:underline"
            >
              Yeni Bir Sayfa Oluştur
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
