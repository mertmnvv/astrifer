import { Card, PageHeader, StatCard } from "@/components/admin/ui";
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
      <PageHeader title="Özet" description="Sipariş hacmi, ciro ve üretim kuyruğuna genel bakış." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Toplam sipariş" value={stats.totalOrders} />
        <StatCard label="Ciro (ödenen)" value={formatTRY(stats.revenue)} tone="amber" glow />
        <StatCard
          label="Baskı bekleyen (Deri Defter)"
          value={stats.pendingPrintCount}
          tone={stats.pendingPrintCount > 0 ? "amber" : "default"}
          href="/admin/orders"
          glow={stats.pendingPrintCount > 0}
        />
      </div>

      <Card title="Duruma Göre Dağılım">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => (
            <div key={status} className="p-4 rounded-xl bg-void/30 border border-text/5">
              <dt className="text-xs text-subtle">{STATUS_LABELS[status]}</dt>
              <dd className="font-display text-2xl italic text-bright mt-1">{stats.countsByStatus[status]}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
