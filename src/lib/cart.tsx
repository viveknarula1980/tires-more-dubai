import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  tire_id: string;
  slug: string;
  name: string;
  price_aed: number;
  image: string;
  size: string;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (tire_id: string) => void;
  setQty: (tire_id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "tm_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add: CartCtx["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.tire_id === item.tire_id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: Math.min(20, next[i].quantity + qty) };
        return next;
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };
  const remove: CartCtx["remove"] = (id) => setItems((p) => p.filter((i) => i.tire_id !== id));
  const setQty: CartCtx["setQty"] = (id, qty) =>
    setItems((p) => p.map((i) => (i.tire_id === id ? { ...i, quantity: Math.max(1, Math.min(20, qty)) } : i)));
  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + i.price_aed * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return <Ctx.Provider value={{ items, add, remove, setQty, clear, total, count }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
