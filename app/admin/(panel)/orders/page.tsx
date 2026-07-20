import { PageHeader } from "@/components/admin/ui";
import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import type { OrderDoc } from "@/types/firestore";
import { OrdersManager, type SerializableOrder } from "./OrdersManager";

export const dynamic = "force-dynamic";

interface OrderRow extends OrderDoc {
  id: string;
}

async function getOrders(): Promise<OrderRow[]> {
  const { getDb } = await import("@/lib/firebase/admin");
  const snapshot = await getDb().collection("orders").orderBy("createdAt", "desc").limit(200).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as OrderDoc) }));
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

  const allOrders = await getOrders();
  const serializableOrders: SerializableOrder[] = allOrders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber ?? "",
    starMapSlug: order.starMapSlug,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    productType: order.productType,
    totalAmount: order.totalAmount ?? order.priceAmount,
    priceAmount: order.priceAmount,
    status: order.status,
    paymentMethod: order.paymentMethod,
    trackingNumber: order.trackingNumber,
    printPdfPath: order.printPdfPath ?? null,
    createdAtIso: order.createdAt.toDate().toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Siparişler" description={`Toplam ${serializableOrders.length} sipariş.`} />
      <OrdersManager orders={serializableOrders} />
    </div>
  );
}

