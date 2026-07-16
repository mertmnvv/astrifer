import Link from "next/link";
import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import { formatTRY } from "@/lib/pricing";
import type { OrderDoc, OrderStatus } from "@/types/firestore";
import { STATUS_LABELS } from "./orders/shared";

export const dynamic = "force-dynamic";

/** Ciroya sayılan durumlar — ödeme onaylanmış (henüz iade edilmemiş) siparişler. */
const REVENUE_STATUSES: OrderStatus[] = ["paid", "fulfilled", "shipped"];
/** Bu durumlardaki bir Deri Defter/paket siparişi, henüz baskıya hazır PDF'i yoksa "baskı bekleyen" sayılır. */
const PRODUCTION_ELIGIBLE_STATUSES: OrderStatus[] = ["paid", "fulfilled"];

interface Stats {
  totalOrders: number;
  revenue: number;
  countsByStatus: Record<OrderStatus, number>;
  pendingPrintCount: number;
}

async function getStats(): Promise<Stats> {
  const { getDb } = await import("@/lib/firebase/admin");
  const snapshot = await getDb()
    .collection("orders")
    .select("status", "priceAmount", "totalAmount", "productType", "printPdfPath")
    .get();

  const countsByStatus = Object.fromEntries(Object.keys(STATUS_LABELS).map((status) => [status, 0])) as Record<
    OrderStatus,
    number
  >;
  let revenue = 0;
  let pendingPrintCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() as Pick<OrderDoc, "status" | "priceAmount" | "totalAmount" | "productType" | "printPdfPath">;
    countsByStatus[data.status] = (countsByStatus[data.status] ?? 0) + 1;
    if (REVENUE_STATUSES.includes(data.status)) {
      revenue += data.totalAmount ?? data.priceAmount;
    }
    if (
      (data.productType === "journal" || data.productType === "bundle") &&
      PRODUCTION_ELIGIBLE_STATUSES.includes(data.status) &&
      !data.printPdfPath
    ) {
      pendingPrintCount += 1;
    }
  }

  return { totalOrders: snapshot.size, revenue, countsByStatus, pendingPrintCount };
}

export default async function AdminDashboardPage() {
  if (!isFirebaseConfigured()) {
    return (
      <p className="text-sm text-subtle">
        Firebase yapılandırılmamış — istatistikleri görmek için <code>.env.local</code> içindeki Admin SDK
        değişkenlerini doldur.
      </p>
    );
  }

  const stats = await getStats();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl italic text-bright border-b border-text/10 pb-4">Özet</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-text/10 bg-panel p-6 shadow-lg">
          <p className="font-mono text-[10px] uppercase tracking-widest text-dim">Toplam sipariş</p>
          <p className="mt-2 font-display text-3xl italic text-bright">{stats.totalOrders}</p>
        </div>
        <div className="rounded-2xl border border-text/10 bg-panel p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-24 h-24 rounded-full bg-amber/5 blur-xl pointer-events-none" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-dim">Ciro (ödenen)</p>
          <p className="mt-2 font-display text-3xl italic text-amber">{formatTRY(stats.revenue)}</p>
        </div>
        <Link
          href="/admin/orders"
          className="rounded-2xl border border-text/10 bg-panel p-6 shadow-lg transition-all hover:border-amber/40 group relative overflow-hidden"
        >
          {stats.pendingPrintCount > 0 && (
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-24 h-24 rounded-full bg-amber/5 blur-xl pointer-events-none" />
          )}
          <p className="font-mono text-[10px] uppercase tracking-widest text-dim group-hover:text-amber transition-colors">Baskı bekleyen (Deri Defter)</p>
          <p className={`mt-2 font-display text-3xl italic transition-colors ${stats.pendingPrintCount > 0 ? "text-amber" : "text-bright"}`}>
            {stats.pendingPrintCount}
          </p>
        </Link>
      </div>

      <div className="rounded-2xl border border-text/10 bg-panel p-6 shadow-lg">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-dim border-b border-text/5 pb-2">Duruma Göre Dağılım</p>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => (
            <div key={status} className="p-4 rounded-xl bg-void/30 border border-text/5">
              <dt className="text-xs text-subtle">{STATUS_LABELS[status]}</dt>
              <dd className="font-display text-2xl italic text-bright mt-1">{stats.countsByStatus[status]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
