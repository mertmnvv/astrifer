import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import { formatTRY } from "@/lib/pricing";
import type { OrderDoc, OrderStatus } from "@/types/firestore";
import { updateOrderAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Bekliyor",
  paid: "Ödendi",
  failed: "Başarısız",
  refunded: "İade edildi",
  fulfilled: "Hazırlandı",
  shipped: "Kargoya verildi",
};

const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as OrderStatus[];

interface OrderRow extends OrderDoc {
  id: string;
}

async function getOrders(): Promise<OrderRow[]> {
  const { getDb } = await import("@/lib/firebase/admin");
  const snapshot = await getDb().collection("orders").orderBy("createdAt", "desc").limit(200).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as OrderDoc) }));
}

function formatDate(timestamp: OrderDoc["createdAt"]): string {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(timestamp.toDate());
}

export default async function AdminOrdersPage() {
  if (!isFirebaseConfigured()) {
    return (
      <p className="text-sm text-subtle">
        Firebase yapılandırılmamış — siparişleri görmek için <code>.env.local</code> içindeki Admin SDK
        değişkenlerini doldur.
      </p>
    );
  }

  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl italic text-bright">Siparişler</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-subtle">Henüz sipariş yok.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-text/10">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-panel font-mono text-[10px] uppercase tracking-widest text-dim">
              <tr>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Ürün</th>
                <th className="px-4 py-3">Tutar</th>
                <th className="px-4 py-3">Durum / Takip No</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-text/10">
                  <td className="px-4 py-3 align-top text-subtle">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="text-text">{order.customerName ?? "—"}</div>
                    <div className="text-xs text-subtle">{order.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-text">
                    {order.productType}
                    {order.size ? ` · ${order.size}` : ""}
                    {order.frameOption && order.frameOption !== "none" ? ` · ${order.frameOption}` : ""}
                  </td>
                  <td className="px-4 py-3 align-top text-text">{formatTRY(order.priceAmount)}</td>
                  <td className="px-4 py-3 align-top">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
