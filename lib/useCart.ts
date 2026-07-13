"use client";

import { useCallback, useEffect, useState } from "react";
import { CART_EVENT, getCart, type CartItem } from "./cart";

/** Reactive view of the localStorage cart — re-syncs on same-tab mutations (CART_EVENT) and cross-tab changes (storage event). */
export function useCart(): CartItem[] {
  const [items, setItems] = useState<CartItem[]>([]);

  const sync = useCallback(() => setItems(getCart()), []);

  useEffect(() => {
    sync();
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  return items;
}
