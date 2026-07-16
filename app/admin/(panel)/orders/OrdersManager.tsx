"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatTRY } from "@/lib/pricing";
import type { OrderStatus, PaymentMethod, ProductType } from "@/types/firestore";
import { updateOrderAction } from "./actions";
import { PAYMENT_METHOD_LABELS, PRODUCT_LABELS, STATUS_LABELS, STATUS_OPTIONS } from "./shared";

export interface SerializableOrder {
  id: string;
  orderNumber: string;
  starMapSlug: string;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  productType: ProductType;
  totalAmount: number;
  priceAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  trackingNumber: string | null;
  printPdfPath: string | null;
  createdAtIso: string;
}

interface OrdersManagerProps {
  orders: SerializableOrder[];
}

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

export function OrdersManager({ orders }: OrdersManagerProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");

  // Status counts for tabs (always based on the total list before status/search filters, but respecting product filter)
  const filteredByProductOrders = useMemo(() => {
    if (productFilter === "all") return orders;
    return orders.filter((o) => o.productType === productFilter);
  }, [orders, productFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: filteredByProductOrders.length };
    STATUS_OPTIONS.forEach((status) => {
      counts[status] = 0;
    });
    filteredByProductOrders.forEach((o) => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [filteredByProductOrders]);

  // Final filtered list
  const filteredOrders = useMemo(() => {
    return filteredByProductOrders.filter((order) => {
      // 1. Status Filter
      if (statusFilter !== "all" && order.status !== statusFilter) return false;

      // 2. Text Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = (order.customerName ?? "").toLowerCase().includes(query);
        const matchesEmail = (order.customerEmail ?? "").toLowerCase().includes(query);
        const matchesNo = (order.orderNumber ?? "").toLowerCase().includes(query);
        const matchesSlug = (order.starMapSlug ?? "").toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesNo || matchesSlug;
      }

      return true;
    });
  }, [filteredByProductOrders, statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* Search & Product Filter Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-dim">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Müşteri adı, e-posta veya sipariş no ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-text/10 bg-text/[0.02] pl-10 pr-4 py-2.5 text-xs text-text placeholder:text-subtle focus:outline-none focus:border-amber/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-dim hover:text-bright"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          )}
        </div>

        {/* Product Type Filter */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="font-mono text-[9px] uppercase tracking-wider text-dim">Ürün:</span>
          <div className="flex bg-text/[0.02] border border-text/10 rounded-full p-1">
            {["all", "digital", "journal", "bundle"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setProductFilter(type);
                  setStatusFilter("all"); // Reset status when product changes
                }}
                className={`rounded-full px-3 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors ${
                  productFilter === type
                    ? "bg-amber text-ink font-semibold"
                    : "text-subtle hover:text-bright"
                }`}
              >
                {type === "all" ? "Tümü" : type === "digital" ? "Dijital" : type === "journal" ? "Defter" : "Paket"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Filtering Tabs */}
      <div className="border-b border-text/10 overflow-x-auto scrollbar-none">
        <nav className="flex gap-6 pb-px">
          <button
            onClick={() => setStatusFilter("all")}
            className={`border-b-2 pb-3 font-mono text-[10px] uppercase tracking-wider transition-all whitespace-nowrap ${
              statusFilter === "all"
                ? "border-amber text-amber font-semibold"
                : "border-transparent text-dim hover:text-bright hover:border-text/20"
            }`}
          >
            Tümü <span className="ml-1 text-[8px] opacity-70">({statusCounts.all})</span>
          </button>
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`border-b-2 pb-3 font-mono text-[10px] uppercase tracking-wider transition-all whitespace-nowrap ${
                statusFilter === status
                  ? "border-amber text-amber font-semibold"
                  : "border-transparent text-dim hover:text-bright hover:border-text/20"
              }`}
            >
              {STATUS_LABELS[status]}
              <span className="ml-1 text-[8px] opacity-70">({statusCounts[status]})</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Orders List Table */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-text/10 bg-text/[0.01] p-12 text-center">
          <p className="text-sm text-subtle">Kriterlere uygun sipariş bulunamadı.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-text/10 bg-panel shadow-xl">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-text/[0.02] border-b border-text/10 font-mono text-[9px] uppercase tracking-widest text-dim">
              <tr>
                <th className="px-5 py-4 w-32">Sipariş No</th>
                <th className="px-5 py-4 w-40">Tarih</th>
                <th className="px-5 py-4 w-72">Müşteri</th>
                <th className="px-5 py-4 w-44">Ürün</th>
                <th className="px-5 py-4 w-28">Tutar</th>
                <th className="px-5 py-4 w-40">Ödeme</th>
                <th className="px-5 py-4 w-28">Baskı</th>
                <th className="px-5 py-4">Durum / Takip Numarası Güncelleme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-text/[0.06]">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-text/[0.01] transition-colors">
                  <td className="px-5 py-4 align-top">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs font-semibold text-amber hover:underline hover:text-amber-light">
                      {order.orderNumber || "DETAY"}
                    </Link>
                  </td>
                  <td className="px-5 py-4 align-top text-subtle font-mono text-xs">
                    {formatDate(order.createdAtIso)}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-text hover:text-amber transition-colors">
                      {order.customerName || "İsimsiz Müşteri"}
                    </Link>
                    <div className="text-xs text-subtle mt-0.5 font-mono">{order.customerEmail}</div>
                    {order.customerPhone && (
                      <div className="text-xs text-subtle mt-0.5 font-mono">{order.customerPhone}</div>
                    )}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className="font-medium text-bright">
                      {PRODUCT_LABELS[order.productType] || order.productType}
                    </span>
                    <div className="text-[10px] text-dim font-mono mt-0.5">slug: {order.starMapSlug}</div>
                  </td>
                  <td className="px-5 py-4 align-top font-mono text-sm font-semibold text-bright">
                    {formatTRY(order.totalAmount)}
                  </td>
                  <td className="px-5 py-4 align-top text-xs">
                    <span className="text-subtle">
                      {order.paymentMethod ? (PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod) : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top">
                    {order.productType === "journal" || order.productType === "bundle" ? (
                      <span
                        className={`rounded-full px-2 py-0.5 border font-mono text-[9px] uppercase tracking-wider font-medium ${
                          order.printPdfPath 
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" 
                            : "border-amber/20 bg-amber/[0.05] text-amber"
                        }`}
                      >
                        {order.printPdfPath ? "PDF Hazır" : "Bekliyor"}
                      </span>
                    ) : (
                      <span className="text-xs text-dim">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <form action={updateOrderAction} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="orderId" value={order.id} />
                      
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="rounded-lg border border-text/10 bg-void px-2 py-1.5 text-xs text-text focus:border-amber/40 focus:outline-none transition-colors"
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
                        placeholder="Kargo takip no"
                        className="w-32 rounded-lg border border-text/10 bg-void px-2 py-1.5 text-xs text-text placeholder:text-subtle focus:border-amber/40 focus:outline-none transition-colors"
                      />

                      <button
                        type="submit"
                        className="rounded-full bg-amber/10 border border-amber/35 px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-wider text-amber font-semibold transition-all hover:bg-amber hover:text-ink"
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
