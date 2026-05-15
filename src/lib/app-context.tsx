import { createContext, useContext, useState, ReactNode } from "react";
import type { Profile } from "./mock-data";

type View = string;
export type CartItem = { id: string; name: string; price: number; qty: number };

interface AppCtx {
  profile: Profile | null;
  setProfile: (p: Profile | null) => void;
  view: View;
  setView: (v: View) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [cart, setCart] = useState<CartItem[]>([]);

  const setProfile = (p: Profile | null) => {
    setProfileState(p);
    setCart([]);
    if (p === "Dealer") setView("home");
    else if (p === "Industrial Customer") setView("sites");
    else if (p === "Industrial Account Manager") setView("customers");
    else setView("dashboard");
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists) return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + item.qty } : c);
      return [...prev, item];
    });
  };

  return <Ctx.Provider value={{ profile, setProfile, view, setView, cart, setCart }}>{children}</Ctx.Provider>;
}

export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("AppProvider missing");
  return c;
};
