import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import type { Profile } from "./mock-data";
import { DEALER_ORDERS, CONTRACTS } from "./mock-data";

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
  dealer?: string;
  location?: string;
  address?: string;
  paymentRef?: string;
};

export type ServiceRequest = {
  id: string;
  siteName: string;
  unitId: string;
  type: string;
  priority: string;
  description: string;
  status?: string;
  raised?: string;
  ts: number;
  comments?: { text: string; date: string }[];
};

export type Complaint = {
  id: string;
  orderId: string;
  type: string;
  priority: string;
  description: string;
  status: string;
  raised: string;
};

export type ReleaseOrder = {
  id: string;
  contractId: string;
  product?: string;
  qty: number;
  site: string;
  date: string;
  eta: string;
  total: number;
  status?: string;
};

export type Notification = {
  id: string;
  text: string;
  read: boolean;
  time: string;
  type: string;
};

export type PosEntry = {
  id: string;
  date: string;
  customer: string;
  phone: string;
  product: string;
  qty: number;
  vehicle: string;
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

let _counter = 1000;
export function genId(prefix: string) {
  _counter += Math.floor(Math.random() * 7) + 3;
  return `${prefix}-${_counter}`;
}

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
  updateServiceRequest: (id: string, patch: Partial<ServiceRequest>) => void;

  complaints: Complaint[];
  addComplaint: (c: Complaint) => void;

  releaseOrders: ReleaseOrder[];
  addReleaseOrder: (r: ReleaseOrder) => void;

  notifications: Notification[];
  addNotification: (text: string, type?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  posEntries: PosEntry[];
  setPosEntries: React.Dispatch<React.SetStateAction<PosEntry[]>>;

  draftReleaseOrder: any | null;
  setDraftReleaseOrder: (d: any | null) => void;

  selectedCustomer: string | null;
  setSelectedCustomer: (c: string | null) => void;
  selectedContractId: string | null;
  setSelectedContractId: (c: string | null) => void;
  selectedSiteId: string | null;
  setSelectedSiteId: (s: string | null) => void;

  dealerOrdersFilter: string | null;
  setDealerOrdersFilter: (v: string | null) => void;
  pendingOrdersFilter: string | null;
  setPendingOrdersFilter: (v: string | null) => void;
  showLowStockBanner: boolean;
  setShowLowStockBanner: (v: boolean) => void;

  action: ActionRequest | null;
  openAction: (req: ActionRequest) => void;
  closeAction: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

const seedOrders: DealerOrder[] = DEALER_ORDERS.map((o) => ({
  ...o,
  dealer: "Sharma Auto Parts",
  location: "Delhi",
  address: "Shop 14, Chandni Chowk Market, Delhi 110006",
  paymentRef: "PAY-" + (Math.floor(Math.random() * 9000) + 1000),
}));

const seedReleaseOrders: ReleaseOrder[] = CONTRACTS.flatMap((c, idx) =>
  Array.from({ length: 2 }, (_, i) => ({
    id: `RO-${2026}-${(c.id.length * 31 + i * 17 + idx * 11) % 9000 + 1000}`,
    contractId: c.id,
    product: c.product,
    qty: 12 + i * 6,
    site: ["NCR-041", "MH-117", "KA-052", "TN-018", "MH-203"][(idx + i) % 5],
    date: `${10 + i * 8} ${["Jan", "Feb", "Mar", "Apr"][i % 4]} 2026`,
    eta: `${15 + i * 8} ${["Jan", "Feb", "Mar", "Apr"][i % 4]} 2026`,
    total: c.rate * (12 + i * 6),
    status: ["Delivered", "Dispatched"][i % 2],
  }))
);

const seedNotifications: Notification[] = [
  { id: "N-1", text: "Stock-out alert: Amaron Pro 35Ah may run out in 9 days at Sharma Auto Parts", read: false, time: "2h ago", type: "alert" },
  { id: "N-2", text: "Order ORD-7855 is now Processing — ETA 19 May", read: false, time: "5h ago", type: "order" },
  { id: "N-3", text: "Indus Towers contract INDT-2024-002 will exhaust 3 weeks before expiry", read: false, time: "1d ago", type: "contract" },
  { id: "N-4", text: "Site NCR-041 has 6 critical units flagged for replacement", read: false, time: "1d ago", type: "fleet" },
  { id: "N-5", text: "New trade scheme 'Q2 Dealer Excellence' launched — earn 2.5% extra margin", read: false, time: "2d ago", type: "scheme" },
];

const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const seedPos: PosEntry[] = [
  { id: "POS-101", date: today, customer: "Walk-in", phone: "", product: "Amaron Pro 35Ah 4W", qty: 2, vehicle: "Car" },
  { id: "POS-102", date: today, customer: "Rajesh K.", phone: "+91 98113 22310", product: "Amaron Hi-Life 2.5Ah 2W", qty: 1, vehicle: "Bike" },
  { id: "POS-103", date: today, customer: "Walk-in", phone: "", product: "Powerzone 45Ah 4W", qty: 1, vehicle: "Car" },
  { id: "POS-104", date: today, customer: "Anil M.", phone: "+91 98114 88110", product: "Amaron FreshPack 60Ah 4W", qty: 1, vehicle: "Car" },
  { id: "POS-105", date: today, customer: "Walk-in", phone: "", product: "Amaron Hi-Life 2.5Ah 2W", qty: 3, vehicle: "Bike" },
  { id: "POS-106", date: today, customer: "Sushil", phone: "+91 98115 41902", product: "Amaron Pro 9Ah 2W", qty: 1, vehicle: "Bike" },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<DealerOrder[]>(seedOrders);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [releaseOrders, setReleaseOrders] = useState<ReleaseOrder[]>(seedReleaseOrders);
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
  const [posEntries, setPosEntries] = useState<PosEntry[]>(seedPos);
  const [draftReleaseOrder, setDraftReleaseOrder] = useState<any | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [dealerOrdersFilter, setDealerOrdersFilter] = useState<string | null>(null);
  const [pendingOrdersFilter, setPendingOrdersFilter] = useState<string | null>(null);
  const [showLowStockBanner, setShowLowStockBanner] = useState(false);
  const [action, setAction] = useState<ActionRequest | null>(null);

  const setProfile = (p: Profile | null) => {
    setProfileState(p);
    setCart([]);
    setSelectedCustomer(null);
    setSelectedContractId(null);
    setSelectedSiteId(null);
    setDealerOrdersFilter(null);
    setPendingOrdersFilter(null);
    setShowLowStockBanner(false);
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

  const addNotification = useCallback((text: string, type = "info") => {
    setNotifications((prev) => [
      { id: "N-" + (prev.length + 100), text, read: false, time: "Just now", type },
      ...prev,
    ]);
  }, []);

  const markNotificationRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllNotificationsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const updateServiceRequest = (id: string, patch: Partial<ServiceRequest>) =>
    setServiceRequests((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s));

  return (
    <Ctx.Provider value={{
      profile, setProfile, view, setView,
      cart, setCart, addToCart,
      orders, addOrder: (o) => setOrders((p) => [o, ...p]),
      serviceRequests, addServiceRequest: (s) => setServiceRequests((p) => [s, ...p]), updateServiceRequest,
      complaints, addComplaint: (c) => setComplaints((p) => [c, ...p]),
      releaseOrders, addReleaseOrder: (r) => setReleaseOrders((p) => [r, ...p]),
      notifications, addNotification, markNotificationRead, markAllNotificationsRead,
      posEntries, setPosEntries,
      draftReleaseOrder, setDraftReleaseOrder,
      selectedCustomer, setSelectedCustomer,
      selectedContractId, setSelectedContractId,
      selectedSiteId, setSelectedSiteId,
      dealerOrdersFilter, setDealerOrdersFilter,
      pendingOrdersFilter, setPendingOrdersFilter,
      showLowStockBanner, setShowLowStockBanner,
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
