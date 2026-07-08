import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import { formatTRY } from "@/lib/pricing";
import type { OrderDoc, OrderStatus } from "@/types/firestore";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Bekliyor",
  paid: "Ödendi",
  failed: "Başarısız",
  refunded: "İade edildi",
  fulfilled: "Hazırlandı",
  shipped: "Kargoya verildi",
};

/** Ciroya sayılan durumlar — ödeme onaylanmış (henüz iade edilmemiş) siparişler. */
const REVENUE_STATUSES: OrderStatus[] = ["paid", "fulfilled", "shipped"];

interface Stats {
  totalOrders: number;
  revenue: number;
  countsByStatus: Record<OrderStatus, number>;
}

async function getStats(): Promise<Stats> {
  const { getDb } = await import("@/lib/firebase/admin");
  const snapshot = await getDb().collection("orders").select("status", "priceAmount").get();

  const countsByStatus = Object.fromEntries(Object.keys(STATUS_LABELS).map((status) => [status, 0])) as Record<
    OrderStatus,
    number
  >;
  let revenue = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() as Pick<OrderDoc, "status" | "priceAmount">;
    countsByStatus[data.status] = (countsByStatus[data.status] ?? 0) + 1;
    if (REVENUE_STATUSES.includes(data.status)) {
      revenue += data.priceAmount;
    }
  }

  return { totalOrders: snapshot.size, revenue, countsByStatus };
}

export default async function AdminDashboardPage() {
  if (!isFirebaseConfigured()) {
    return (
      <p className="text-sm text-haze">
        Firebase yapılandırılmamış — istatistikleri görmek için <code>.env.local</code> içindeki Admin SDK
        değişkenlerini doldur.
      </p>
    );
  }

  const stats = await getStats();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl italic text-text">Özet</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-brass-dim/40 bg-panel-navy p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-haze">Toplam sipariş</p>
          <p className="mt-2 font-display text-3xl italic text-text">{stats.totalOrders}</p>
        </div>
        <div className="rounded-lg border border-brass-dim/40 bg-panel-navy p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-haze">Ciro (ödenen)</p>
          <p className="mt-2 font-display text-3xl italic text-brass">{formatTRY(stats.revenue)}</p>
        </div>
      </div>

      <div className="rounded-lg border border-brass-dim/40 bg-panel-navy p-6">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-haze">Duruma göre dağılım</p>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => (
            <div key={status}>
              <dt className="text-xs text-haze">{STATUS_LABELS[status]}</dt>
              <dd className="font-display text-xl italic text-text">{stats.countsByStatus[status]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
