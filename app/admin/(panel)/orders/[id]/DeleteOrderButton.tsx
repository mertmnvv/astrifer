"use client";

import { deleteOrderAction } from "../actions";

export function DeleteOrderButton({ orderId }: { orderId: string }) {
  return (
    <form action={deleteOrderAction} className="mt-3">
      <input type="hidden" name="orderId" value={orderId} />
      <button
        type="submit"
        className="w-full rounded-full border border-red-500/40 bg-red-500/5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-red-500 transition-all hover:bg-red-500 hover:text-white"
        onClick={(e) => {
          if (!window.confirm("Bu siparişi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
            e.preventDefault();
          }
        }}
      >
        Siparişi Sil
      </button>
    </form>
  );
}
