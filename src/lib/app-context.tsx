import { createContext, useContext, useState, ReactNode } from "react";
import type { Profile } from "./mock-data";

type View = string;
export type CartItem = { id: string; name: string; price: number; qty: number };

export type DealerOrder = {
  id: string;
  date: string;
  items: string;
  total: number;
  status: string;
  eta: string;
  cart?: CartItem[];
};

export type ServiceRequest = {
  id: string;
  siteName: string;
  unitId: string;
  type: string;
  priority: string;
  description: string;
  ts: number;
};

export type ReleaseOrder = {
  id: string;
  contractId: string;
  qty: number;
  site: string;
  date: string;
  eta: string;
  total: number;
};

export type ActionField =
  | { type: "text"; name: string; label: string; placeholder?: string; defaultValue?: string }
  | { type: "textarea"; name: string; label: string; placeholder?: string; defaultValue?: string }
  | { type: "number"; name: string; label: string; defaultValue?: number }
  | { type: "date"; name: string; label: string; defaultValue?: string }
  | { type: "select"; name: string; label: string; options: string[]; defaultValue?: string };

export type ActionRequest = {
  title: string;
  description?: string;
  summary?: { label: string; value: string }[];
  fields?: ActionField[];
  confirmLabel?: string;
  successTitle?: string;
  successDescription?: string;
};

interface AppCtx {
  profile: Profile | null;
  setProfile: (p: Profile | null) => void;
  view: View;
  setView: (v: View) => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (item: CartItem) => void;

  orders: DealerOrder[];
  addOrder: (o: DealerOrder) => void;

  serviceRequests: ServiceRequest[];
  addServiceRequest: (s: ServiceRequest) => void;

  releaseOrders: ReleaseOrder[];
  addReleaseOrder: (r: ReleaseOrder) => void;

  selectedCustomer: string | null;
  setSelectedCustomer: (c: string | null) => void;

  selectedContractId: string | null;
  setSelectedContractId: (c: string | null) => void;

  dealerOrdersFilter: string | null; // e.g. "dormant"
  setDealerOrdersFilter: (v: string | null) => void;

  action: ActionRequest | null;
  openAction: (req: ActionRequest) => void;
  closeAction: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<DealerOrder[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [releaseOrders, setReleaseOrders] = useState<ReleaseOrder[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [dealerOrdersFilter, setDealerOrdersFilter] = useState<string | null>(null);
  const [action, setAction] = useState<ActionRequest | null>(null);

  const setProfile = (p: Profile | null) => {
    setProfileState(p);
    setCart([]);
    setSelectedCustomer(null);
    setSelectedContractId(null);
    setDealerOrdersFilter(null);
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

  return (
    <Ctx.Provider value={{
      profile, setProfile, view, setView, cart, setCart, addToCart,
      orders, addOrder: (o) => setOrders((p) => [o, ...p]),
      serviceRequests, addServiceRequest: (s) => setServiceRequests((p) => [s, ...p]),
      releaseOrders, addReleaseOrder: (r) => setReleaseOrders((p) => [r, ...p]),
      selectedCustomer, setSelectedCustomer,
      selectedContractId, setSelectedContractId,
      dealerOrdersFilter, setDealerOrdersFilter,
      action, openAction: setAction, closeAction: () => setAction(null),
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("AppProvider missing");
  return c;
};
