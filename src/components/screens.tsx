import React, { useState, useMemo, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import {
  PRODUCTS, DEALER_ORDERS, REGIONAL_ORDERS, SKU_SELLTHROUGH, REGIONS,
  STOCKOUT_ALERTS, SITES, SITE_UNITS, ALL_FLEET_SITES, CONTRACTS,
  fmtINR, fmtINRLakh,
} from "@/lib/mock-data";
import { useApp, type CartItem, type DealerOrder } from "@/lib/app-context";
import { StatCard, StatusBadge, PageHeader, AISuggestions, Btn, FilterBar, Pagination } from "./ui-bits";
import { Search, ShoppingCart, X, Plus, Minus, ArrowRight, Trash2, ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Package, AlertTriangle, Phone, Mail, RefreshCw, Receipt, MessageSquare, BarChart2, Pencil, Download } from "lucide-react";
import { ProductDetailModal, TrackOrderModal, InvoicePanel, ComplaintModal, EscalateModal, ContactDealerCard, StarRating, SkuDetailModal, RegionDetailModal } from "./shared";

const PAGE_SIZE = 8;
const DELIVERY_ADDRESS = "Shop 14, Chandni Chowk Market, Delhi 110006";

/* =================== SHARED OVERLAY HELPERS =================== */

function CenterModal({ children, widthClass = "max-w-lg" }: { children: ReactNode; widthClass?: string }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/50" />
      <div
        className={`relative bg-white w-full ${widthClass} rounded-xl overflow-hidden`}
        style={{ border: "1px solid #E5E7EB", maxHeight: "92vh", display: "flex", flexDirection: "column" }}
      >
        {children}
      </div>
    </div>
  );
}

function RightDrawer({ title, sub, onClose, children }: { title: string; sub?: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute top-0 right-0 h-full bg-white overflow-y-auto"
        style={{ width: "min(560px, 100%)", borderLeft: "1px solid #E5E7EB", boxShadow: "-12px 0 24px rgba(0,0,0,0.08)" }}
      >
        <div className="flex justify-between items-start px-5 py-4 sticky top-0 bg-white" style={{ borderBottom: "1px solid #E5E7EB", zIndex: 1 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h2>
            {sub && <div style={{ fontSize: 12, color: "#4B5563", marginTop: 2 }}>{sub}</div>}
          </div>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, body, confirmLabel = "Confirm", onConfirm, onCancel }: {
  title: string; body: ReactNode; confirmLabel?: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <CenterModal widthClass="max-w-md">
      <div className="px-5 py-4" style={{ borderBottom: "1px solid #E5E7EB" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
      </div>
      <div className="p-5" style={{ fontSize: 14, color: "#0A0A0F" }}>{body}</div>
      <div className="px-5 py-3 flex justify-end gap-2" style={{ borderTop: "1px solid #E5E7EB", background: "#F9FAFB" }}>
        <Btn variant="ghost" size="sm" onClick={onCancel}>Cancel</Btn>
        <Btn size="sm" onClick={onConfirm}>{confirmLabel}</Btn>
      </div>
    </CenterModal>
  );
}

/* =================== TIMELINE =================== */

const TRACK_STAGES = ["Order Placed", "Confirmed by Warehouse", "Dispatched", "Out for Delivery", "Delivered"];

function activeIndexFor(status: string) {
  if (status === "Delivered") return 4;
  if (status === "Out for Delivery") return 3;
  if (status === "Dispatched") return 2;
  if (status === "Processing" || status === "Confirmed") return 1;
  return 0;
}

function StageTimeline({ status }: { status: string }) {
  const active = activeIndexFor(status);
  return (
    <div className="space-y-3">
      {TRACK_STAGES.map((stage, i) => {
        const done = i <= active;
        const isCurrent = i === active && status !== "Delivered";
        const color = isCurrent ? "#C00000" : done ? "#15803D" : "#D1D5DB";
        return (
          <div key={stage} className="flex items-start gap-3">
            <div className="flex flex-col items-center" style={{ minWidth: 18 }}>
              <div
                style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: done ? color : "#FFFFFF",
                  border: `2px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {done && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFFFFF" }} />}
              </div>
              {i < TRACK_STAGES.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 24, background: i < active ? "#15803D" : "#E5E7EB", marginTop: 2 }} />
              )}
            </div>
            <div className="pb-3">
              <div style={{ fontSize: 14, fontWeight: isCurrent ? 700 : 600, color: isCurrent ? "#C00000" : "#0A0A0F" }}>{stage}</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                {done && !isCurrent ? "Completed" : isCurrent ? "In progress" : "Pending"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =================== SUCCESS BANNER =================== */

function SuccessBanner({ text, onClose }: { text: string; onClose?: () => void }) {
  return (
    <div className="rounded-lg p-3 mb-4 flex items-start gap-3" style={{ background: "#DCFCE7", border: "1px solid #86EFAC" }}>
      <CheckCircle2 size={18} color="#15803D" style={{ marginTop: 1 }} />
      <div className="flex-1" style={{ fontSize: 13, color: "#14532D", fontWeight: 600 }}>{text}</div>
      {onClose && <button onClick={onClose}><X size={16} color="#14532D" /></button>}
    </div>
  );
}

/* =================== DEALER: HOME =================== */
export function DealerHome() {
  const { setView, addToCart, setPendingOrdersFilter, setShowLowStockBanner } = useApp();
  const [schemeOpen, setSchemeOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgBody, setMsgBody] = useState("");
  const reorderNow = () => {
    addToCart({ id: "P1", name: "Amaron Pro 35Ah 4W", price: 4200, qty: 40 });
    setView("catalog");
  };
  return (
    <div>
      <PageHeader title="Welcome back, Sharma Auto Parts" sub="Quick view of your store activity" />
      <AISuggestions
        items={[
          { text: "Amaron Pro 35Ah may run out in 9 days based on your sales pattern. Reorder 40 units now to avoid stock-out.", action: "Reorder Now", onAction: reorderNow },
          { text: "‘Summer Boost’ scheme is active — earn 2% extra credit on orders above ₹2 L till 31 May.", action: "View Catalog", onAction: () => setView("catalog") },
          { text: "Your 9-day order gap exceeds your 7-day average. Place a quick reorder to maintain shelf health.", action: "Quick Reorder", onAction: () => setView("catalog") },
          { text: "Powerzone Hummer 65Ah trending +18% in your region — consider stocking 12 units.", action: "Add to Cart", onAction: () => setView("catalog") },
        ]}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard label="Open Orders" value="2" change="ETA 19–20 May" accent="crimson" onClick={() => { setPendingOrdersFilter("active"); setView("orders"); }} />
        <StatCard label="Sales This Week" value="₹1.84 L" change="+12% vs last week" accent="green" onClick={() => setView("orders")} />
        <StatCard label="SKUs in Low Stock" value="3" change="Reorder recommended" accent="amber" onClick={() => { setShowLowStockBanner(true); setView("pos"); }} />
        <StatCard label="Days Since Last Order" value="9" change="Avg cycle: 7 days" accent="amber" onClick={() => setView("catalog")} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-base">
          <div className="stat-label mb-3">Quick actions</div>
          <div className="flex flex-col gap-2">
            <button onClick={() => setView("catalog")} className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-[#F3F4F6]" style={{ border: "1px solid #E5E7EB", fontSize: 14 }}>
              Browse Catalog <ArrowRight size={16} />
            </button>
            <button onClick={() => setView("orders")} className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-[#F3F4F6]" style={{ border: "1px solid #E5E7EB", fontSize: 14 }}>
              View My Orders <ArrowRight size={16} />
            </button>
            <button onClick={() => setView("pos")} className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-[#F3F4F6]" style={{ border: "1px solid #E5E7EB", fontSize: 14 }}>
              Log a Sale <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="card-base">
          <div className="stat-label mb-3">Top SKUs this month</div>
          <div className="space-y-3">
            {SKU_SELLTHROUGH.slice(0, 5).map((s) => (
              <div key={s.sku}>
                <div className="flex justify-between" style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 500 }}>{s.sku}</span><span style={{ color: "#4B5563" }}>{s.units} units</span>
                </div>
                <div className="h-2 rounded-full mt-1.5" style={{ background: "#E5E7EB" }}>
                  <div className="h-full rounded-full" style={{ width: `${(s.units / 2200) * 100}%`, background: "#C00000" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-base mt-4" style={{ borderTop: "3px solid #534AB7" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#534AB7", letterSpacing: 0.5 }}>ACTIVE SCHEME</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>Q2 Dealer Excellence Scheme</div>
        <div className="flex flex-wrap gap-4 mt-2" style={{ fontSize: 13, color: "#4B5563" }}>
          <span>Target: <b style={{ color: "#0A0A0F" }}>80 units</b></span>
          <span>Achieved: <b style={{ color: "#0A0A0F" }}>54 units</b></span>
          <span>Reward: <b style={{ color: "#0A0A0F" }}>+2.5% margin</b></span>
        </div>
        <div className="h-2 rounded-full mt-3" style={{ background: "#E5E7EB" }}>
          <div className="h-full rounded-full" style={{ width: "67%", background: "#534AB7" }} />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span style={{ fontSize: 12, color: "#6B7280" }}>Scheme ends 31 May 2026</span>
          <Btn variant="ghost" size="sm" onClick={() => setSchemeOpen(true)}>View Scheme Details</Btn>
        </div>
      </div>

      <div className="card-base mt-4" style={{ borderLeft: "3px solid #00A651" }}>
        <div className="stat-label">Your Dealer Sales Representative</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6 }}>Rajiv Menon</div>
        <div className="flex items-center gap-2 mt-2" style={{ fontSize: 13, color: "#4B5563" }}>
          <Phone size={14} /> +91 98100 44321
        </div>
        <div className="flex items-center gap-2 mt-1" style={{ fontSize: 13, color: "#4B5563" }}>
          <Mail size={14} /> rajiv.menon@amararaja.com
        </div>
        <div className="flex gap-2 mt-3">
          <Btn variant="ghost" size="sm" onClick={() => toast.success("Calling Rajiv Menon...")}>Call Now</Btn>
          <Btn variant="ghost" size="sm" onClick={() => setMsgOpen(true)}>Send Message</Btn>
        </div>
      </div>

      {schemeOpen && (
        <CenterModal widthClass="max-w-lg">
          <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid #E5E7EB" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Q2 Dealer Excellence Scheme</h3>
            <button onClick={() => setSchemeOpen(false)} aria-label="Close"><X size={18} /></button>
          </div>
          <div className="p-5 overflow-y-auto" style={{ flex: 1 }}>
            <p style={{ fontSize: 13, color: "#4B5563" }}>Earn additional margin credits based on monthly unit sales across all Amara Raja SKUs.</p>
            <div className="rounded-lg overflow-hidden mt-4" style={{ border: "1px solid #E5E7EB" }}>
              <table className="w-full" style={{ fontSize: 13 }}>
                <thead style={{ background: "#F9FAFB" }}>
                  <tr style={{ color: "#4B5563", fontSize: 11, textTransform: "uppercase", textAlign: "left" }}>
                    <th className="py-2 px-3">Tier</th><th className="py-2 px-3">Target</th><th className="py-2 px-3">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderTop: "1px solid #E5E7EB" }}><td className="py-2 px-3">Tier 1</td><td className="py-2 px-3">50 units</td><td className="py-2 px-3">+1.5% margin</td></tr>
                  <tr style={{ borderTop: "1px solid #E5E7EB", background: "#EEF0FF" }}><td className="py-2 px-3" style={{ fontWeight: 700 }}>Tier 2 (current)</td><td className="py-2 px-3">80 units</td><td className="py-2 px-3">+2.5% margin</td></tr>
                  <tr style={{ borderTop: "1px solid #E5E7EB" }}><td className="py-2 px-3">Tier 3</td><td className="py-2 px-3">120 units</td><td className="py-2 px-3">+4% margin</td></tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4" style={{ fontSize: 13 }}>Your Standing: <b>Rank 3 of 12 NCR dealers</b></div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>Scheme valid: 01 Apr 2026 to 31 May 2026</div>
          </div>
          <div className="px-5 py-3 flex justify-end" style={{ borderTop: "1px solid #E5E7EB", background: "#F9FAFB" }}>
            <Btn size="sm" onClick={() => setSchemeOpen(false)}>Close</Btn>
          </div>
        </CenterModal>
      )}

      {msgOpen && (
        <CenterModal widthClass="max-w-md">
          <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid #E5E7EB" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Message Your DSR</h3>
            <button onClick={() => setMsgOpen(false)} aria-label="Close"><X size={18} /></button>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <label className="stat-label block mb-1">Subject</label>
              <input readOnly value="Query from Sharma Auto Parts" className="w-full px-3 py-2 rounded-md" style={{ border: "1px solid #D1D5DB", fontSize: 13, background: "#F3F4F6" }} />
            </div>
            <div>
              <label className="stat-label block mb-1">Your message</label>
              <textarea value={msgBody} onChange={(e) => setMsgBody(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-md" style={{ border: "1px solid #D1D5DB", fontSize: 13 }} />
            </div>
          </div>
          <div className="px-5 py-3 flex justify-end gap-2" style={{ borderTop: "1px solid #E5E7EB", background: "#F9FAFB" }}>
            <Btn variant="ghost" size="sm" onClick={() => setMsgOpen(false)}>Cancel</Btn>
            <Btn size="sm" onClick={() => { setMsgOpen(false); setMsgBody(""); toast.success("Message sent to Rajiv Menon"); }}>Send</Btn>
          </div>
        </CenterModal>
      )}
    </div>
  );
}

/* =================== DEALER: CATALOG =================== */
export function ProductCatalog() {
  const [filter, setFilter] = useState<"All" | "2W" | "4W" | "Industrial">("All");
  const [search, setSearch] = useState("");
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [detailProduct, setDetailProduct] = useState<typeof PRODUCTS[number] | null>(null);
  const { cart, addToCart, setView } = useApp();

  const filtered = PRODUCTS.filter((p) =>
    (filter === "All" || p.type === filter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const setQty = (id: string, q: number) => setQtyMap({ ...qtyMap, [id]: Math.max(1, q) });
  const getQty = (id: string) => qtyMap[id] ?? 1;
  const totalCartItems = cart.reduce((s, c) => s + c.qty, 0);

  const handleAdd = (id: string, q?: number) => {
    const p = PRODUCTS.find((x) => x.id === id)!;
    const quantity = q ?? getQty(id);
    addToCart({ id, name: p.name, price: p.price, qty: quantity });
    toast.success(`${p.name} ×${quantity} added to cart`);
    setQtyMap({ ...qtyMap, [id]: 1 });
  };

  return (
    <div>
      <PageHeader title="Product Catalog" sub="Browse and order from the full Amara Raja range" />
      <AISuggestions
        items={[
          { text: "Amaron Pro 35Ah is your top mover — recommended reorder of 40 units this week.", action: "Add 40", onAction: () => { addToCart({ id: "P1", name: "Amaron Pro 35Ah 4W", price: 4200, qty: 40 }); toast.success("Added 40 × Amaron Pro 35Ah"); } },
          { text: "Powerzone 45Ah will stock-out in 12 days at current sell rate. Consider reordering now.", action: "Add 30", onAction: () => { addToCart({ id: "P3", name: "Powerzone 45Ah 4W", price: 3600, qty: 30 }); toast.success("Added 30 × Powerzone 45Ah"); } },
          { text: "Industrial demand from Indus Towers is up 12% — stock Quanta 150Ah for institutional pickup.", action: "Add 5", onAction: () => { addToCart({ id: "P6", name: "Quanta 150Ah Industrial", price: 18500, qty: 5 }); toast.success("Added 5 × Quanta 150Ah"); } },
        ]}
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} style={{ position: "absolute", left: 12, top: 11, color: "#6B7280" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2.5 rounded-md outline-none"
            style={{ border: "1px solid #D1D5DB", fontSize: 14, background: "#FFFFFF" }}
          />
        </div>
        <div className="flex gap-1.5 items-center flex-wrap">
          {(["All", "2W", "4W", "Industrial"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-full"
              style={{
                fontSize: 12,
                background: filter === f ? "#C00000" : "#FFFFFF",
                color: filter === f ? "#FFFFFF" : "#0A0A0F",
                border: "1px solid #D1D5DB",
                fontWeight: 600,
              }}
            >
              {f}
            </button>
          ))}
          <button
            onClick={() => setView("cart")}
            className="px-3 py-1.5 rounded-full flex items-center gap-1.5"
            style={{ fontSize: 13, background: "#0A0A0F", color: "#FFFFFF", fontWeight: 600 }}
          >
            <ShoppingCart size={14} /> Cart ({totalCartItems})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="card-base flex flex-col">
            <button
              type="button"
              onClick={() => setDetailProduct(p)}
              className="rounded-md overflow-hidden mb-3 text-left"
              style={{ height: 160, background: "#F3F4F6", border: 0, padding: 0, cursor: "pointer" }}
              aria-label={`View details for ${p.name}`}
            >
              <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
            <div className="flex items-start justify-between gap-2 mb-1">
              <button
                type="button"
                onClick={() => setDetailProduct(p)}
                style={{ fontSize: 15, fontWeight: 600, textAlign: "left", background: "transparent", border: 0, padding: 0, cursor: "pointer" }}
              >
                {p.name}
              </button>
              <span
                className="px-2 py-0.5 rounded"
                style={{
                  fontSize: 10,
                  background: p.brand === "Amaron" ? "#2E0D0D" : "#E5E7EB",
                  color: p.brand === "Amaron" ? "#FFFFFF" : "#0A0A0F",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {p.brand}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#4B5563" }}>{p.type} · {p.spec}</div>
            <div className="mt-3">
              <div style={{ fontSize: 20, fontWeight: 700 }}>{fmtINR(p.price)}</div>
              <div style={{ fontSize: 12, color: p.stock === "Low Stock" ? "#EF9F27" : "#15803D", fontWeight: 600 }}>{p.stock}</div>
            </div>
            <div className="flex items-center justify-between mt-3 gap-2">
              <div className="flex items-center" style={{ border: "1px solid #D1D5DB", borderRadius: 6 }}>
                <button onClick={() => setQty(p.id, getQty(p.id) - 1)} style={{ padding: "6px 8px" }} aria-label="Decrease"><Minus size={14} /></button>
                <input
                  type="number"
                  value={getQty(p.id)}
                  onChange={(e) => setQty(p.id, Number(e.target.value) || 1)}
                  className="text-center"
                  style={{ width: 44, fontSize: 13, padding: "5px 0", border: "none", outline: "none" }}
                />
                <button onClick={() => setQty(p.id, getQty(p.id) + 1)} style={{ padding: "6px 8px" }} aria-label="Increase"><Plus size={14} /></button>
              </div>
              <Btn onClick={() => handleAdd(p.id)} size="sm">Add to Cart</Btn>
            </div>
          </div>
        ))}
      </div>
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAdd={() => handleAdd(detailProduct.id, getQty(detailProduct.id))}
        />
      )}
    </div>
  );
}

/* =================== DEALER: CART =================== */

function OrderConfirmationModal({ cart, total, onCancel, onConfirm }: {
  cart: CartItem[]; total: number;
  onCancel: () => void;
  onConfirm: (deliveryDate: string, urgent: boolean, finalTotal: number) => void;
}) {
  const defaultDate = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  const [date, setDate] = useState(defaultDate);
  const [urgent, setUrgent] = useState(false);
  const grand = total + (urgent ? 250 : 0);
  return (
    <CenterModal widthClass="max-w-2xl">
      <div className="px-5 py-4" style={{ borderBottom: "1px solid #E5E7EB", background: "#EEF0FF" }}>
        <h3 style={{ fontSize: 17, fontWeight: 700 }}>Confirm Your Order</h3>
        <div style={{ fontSize: 12, color: "#4B5563", marginTop: 2 }}>Review the details below and confirm to place your order.</div>
      </div>
      <div className="p-5 overflow-y-auto" style={{ flex: 1 }}>
        <div className="mb-4">
          <label className="stat-label block mb-1">Delivery Address</label>
          <input
            value={DELIVERY_ADDRESS}
            readOnly
            className="w-full px-3 py-2 rounded-md"
            style={{ border: "1px solid #D1D5DB", fontSize: 13, background: "#F3F4F6" }}
          />
        </div>
        <div className="mb-3">
          <label className="stat-label block mb-1">Preferred Delivery Date</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-md"
            style={{ border: "1px solid #D1D5DB", fontSize: 13, background: "#FFFFFF" }}
          />
        </div>
        <label className="flex items-center gap-2 mb-1" style={{ fontSize: 13 }}>
          <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
          Request Urgent Delivery (+₹250)
        </label>
        <div className="mb-4" style={{ fontSize: 12, color: urgent ? "#15803D" : "#6B7280", fontWeight: 600 }}>
          {urgent ? "Estimated: Next day delivery" : "Estimated: 3 business days"}
        </div>
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
          <table className="w-full" style={{ fontSize: 13 }}>
            <thead style={{ background: "#F9FAFB" }}>
              <tr style={{ color: "#4B5563", fontSize: 11, textTransform: "uppercase", textAlign: "left" }}>
                <th className="py-2 px-3">Item</th>
                <th className="py-2 px-3">Qty</th>
                <th className="py-2 px-3" style={{ textAlign: "right" }}>Line total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                  <td className="py-2 px-3">{c.name}</td>
                  <td className="py-2 px-3">{c.qty}</td>
                  <td className="py-2 px-3" style={{ textAlign: "right", fontWeight: 600 }}>{fmtINR(c.price * c.qty)}</td>
                </tr>
              ))}
              {urgent && (
                <tr style={{ borderTop: "1px solid #E5E7EB" }}>
                  <td className="py-2 px-3" colSpan={2}>Urgency surcharge</td>
                  <td className="py-2 px-3" style={{ textAlign: "right", fontWeight: 600 }}>{fmtINR(250)}</td>
                </tr>
              )}
              <tr style={{ background: "#F9FAFB", borderTop: "1px solid #E5E7EB" }}>
                <td className="py-3 px-3" style={{ fontWeight: 700 }} colSpan={2}>Order Total</td>
                <td className="py-3 px-3" style={{ textAlign: "right", fontWeight: 700, fontSize: 14 }}>{fmtINR(grand)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="px-5 py-3 flex justify-end gap-2" style={{ borderTop: "1px solid #E5E7EB", background: "#F9FAFB" }}>
        <Btn variant="ghost" size="sm" onClick={onCancel}>Cancel</Btn>
        <Btn size="sm" onClick={() => onConfirm(date, urgent, grand)}>Confirm Order</Btn>
      </div>
    </CenterModal>
  );
}

export function CartPage() {
  const { cart, setCart, setView, addOrder } = useApp();
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [promo, setPromo] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const gst = Math.round(subtotal * 0.18);
  const delivery = subtotal > 200000 ? 0 : 500;
  const total = subtotal - promoDiscount + gst + delivery;

  const updateQty = (id: string, q: number) => {
    if (q <= 0) setCart(cart.filter((c) => c.id !== id));
    else setCart(cart.map((c) => c.id === id ? { ...c, qty: q } : c));
  };

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === "DEALER20") {
      setPromoDiscount(Math.round(subtotal * 0.05));
      setPromoError("");
    } else {
      setPromoDiscount(0);
      setPromoError("Invalid promo code");
    }
  };

  const placeOrder = (deliveryDate: string, urgent: boolean, finalTotal: number) => {
    const id = "ORD-" + Math.floor(1000 + Math.random() * 9000);
    const eta = new Date(new Date(deliveryDate).getTime() + (urgent ? 86400000 : 86400000)).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const itemsStr = cart.map((c) => `${c.name} ×${c.qty}`).join(", ");
    const order: DealerOrder = { id, date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), items: itemsStr, total: finalTotal, status: "Processing", eta, cart: [...cart] };
    addOrder(order);
    setCart([]);
    setConfirming(false);
    setSuccess(`Order ${id} placed successfully${urgent ? " (urgent)" : ""}. Estimated delivery: ${eta}`);
    setTimeout(() => setView("orders"), 1500);
  };

  if (cart.length === 0 && !success) {
    return (
      <div>
        <PageHeader title="Your Cart" sub="Review items before placing your order" />
        <div className="card-base text-center py-12">
          <ShoppingCart size={48} color="#9CA3AF" style={{ margin: "0 auto" }} />
          <p style={{ fontSize: 16, color: "#4B5563", marginTop: 12 }}>Your cart is empty</p>
          <div className="mt-4">
            <Btn onClick={() => setView("catalog")}>Browse Catalog</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {success && <SuccessBanner text={success} />}
      <PageHeader title="Your Cart" sub={`${cart.length} item${cart.length === 1 ? "" : "s"} · Review and proceed to checkout`} />
      {cart.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="card-base p-0">
              <table className="w-full" style={{ fontSize: 13 }}>
                <thead>
                  <tr style={{ color: "#4B5563", fontSize: 11, textTransform: "uppercase", textAlign: "left" }}>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((c) => (
                    <tr key={c.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                      <td className="py-3 px-4" style={{ fontWeight: 500 }}>{c.name}</td>
                      <td className="py-3 px-4">{fmtINR(c.price)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center" style={{ border: "1px solid #D1D5DB", borderRadius: 6, width: "fit-content" }}>
                          <button onClick={() => updateQty(c.id, c.qty - 1)} style={{ padding: "4px 8px" }}><Minus size={12} /></button>
                          <span style={{ minWidth: 32, textAlign: "center" }}>{c.qty}</span>
                          <button onClick={() => updateQty(c.id, c.qty + 1)} style={{ padding: "4px 8px" }}><Plus size={12} /></button>
                        </div>
                      </td>
                      <td className="py-3 px-4" style={{ fontWeight: 600 }}>{fmtINR(c.price * c.qty)}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => updateQty(c.id, 0)} aria-label="Remove"><Trash2 size={16} color="#C00000" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-base">
              <div className="flex gap-2 items-center">
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Promo code"
                  className="flex-1 px-3 py-2 rounded-md"
                  style={{ border: "1px solid #D1D5DB", fontSize: 13 }}
                />
                <Btn size="sm" onClick={applyPromo}>Apply</Btn>
              </div>
              {promoError && <div style={{ fontSize: 12, color: "#C00000", marginTop: 6 }}>{promoError}</div>}
              {promoDiscount > 0 && <div style={{ fontSize: 12, color: "#15803D", marginTop: 6, fontWeight: 600 }}>Promo applied: 5% off</div>}
            </div>
          </div>

          <div className="card-base h-fit" style={{ borderTop: "3px solid #5B5BF5" }}>
            <div className="stat-label mb-3">Order Summary</div>
            <div className="space-y-2.5" style={{ fontSize: 14 }}>
              <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Subtotal</span><span>{fmtINR(subtotal)}</span></div>
              {promoDiscount > 0 && (
                <div className="flex justify-between" style={{ color: "#15803D" }}><span>Discount (DEALER20)</span><span>−{fmtINR(promoDiscount)}</span></div>
              )}
              <div className="flex justify-between"><span style={{ color: "#4B5563" }}>GST (18%)</span><span>{fmtINR(gst)}</span></div>
              <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Delivery</span><span>{delivery === 0 ? "FREE" : fmtINR(delivery)}</span></div>
              <div className="flex justify-between pt-3" style={{ borderTop: "1px solid #E5E7EB", fontSize: 16, fontWeight: 700 }}>
                <span>Total</span><span>{fmtINR(total)}</span>
              </div>
            </div>
            <div className="mt-4 p-3 rounded" style={{ background: "#EEF0FF", border: "1px solid #C7CCF7", fontSize: 12, color: "#2B31B8" }}>
              Cogniq: Adding 4 more units of Amaron Pro 35Ah qualifies you for a 3% volume discount.
            </div>
            <button
              onClick={() => setConfirming(true)}
              className="w-full mt-4 py-3 rounded-md text-white"
              style={{ background: "#C00000", fontSize: 14, fontWeight: 700 }}
            >
              Place Order
            </button>
            <button
              onClick={() => setView("catalog")}
              className="w-full mt-2 py-2.5 rounded-md"
              style={{ background: "#FFFFFF", border: "1px solid #D1D5DB", fontSize: 13, fontWeight: 600 }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
      {confirming && (
        <OrderConfirmationModal
          cart={cart}
          total={total}
          onCancel={() => setConfirming(false)}
          onConfirm={placeOrder}
        />
      )}
    </div>
  );
}

/* =================== DEALER: ORDERS =================== */
export function MyOrders() {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("30d");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [trackOrder, setTrackOrder] = useState<DealerOrder | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<DealerOrder | null>(null);
  const [complaintOrder, setComplaintOrder] = useState<DealerOrder | null>(null);
  const { orders, complaints, addToCart, setView } = useApp();

  const all: DealerOrder[] = useMemo(() => {
    const ids = new Set(orders.map((o) => o.id));
    return [...orders, ...DEALER_ORDERS.filter((o) => !ids.has(o.id))];
  }, [orders]);

  const filtered = all.filter((o) =>
    (statusFilter === "All" || o.status === statusFilter) &&
    (o.id.toLowerCase().includes(search.toLowerCase()) || o.items.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const reorder = (o: DealerOrder) => {
    if (o.cart && o.cart.length > 0) {
      o.cart.forEach((c) => addToCart(c));
    } else {
      // synthesize from items string -> default reorder of P1
      addToCart({ id: "P1", name: "Amaron Pro 35Ah 4W", price: 4200, qty: 10 });
    }
    toast.success(`Items from ${o.id} added to cart`);
    setView("cart");
  };

  return (
    <div>
      <PageHeader title="My Orders" sub="Track every order placed with Amara Raja" />
      <AISuggestions
        items={[
          { text: "ORD-7860 (Amaron Hi-Life ×24) is processing — projected to dispatch by 18 May.", action: "Track", onAction: () => setTrackOrder(all.find((o) => o.id === "ORD-7860") ?? null) },
          { text: "Based on your sales pattern, Amaron Pro 35Ah may run out in 9 days. Reorder now?", action: "Reorder Now", onAction: () => { addToCart({ id: "P1", name: "Amaron Pro 35Ah 4W", price: 4200, qty: 40 }); toast.success("Added 40 × Amaron Pro 35Ah"); setView("cart"); } },
          { text: "Your average order cycle is 7 days. Consider scheduling weekly auto-reorders for top SKUs.", action: "Set up Auto-reorder" },
        ]}
      />
      <FilterBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} dateRange={dateRange} onDateRange={setDateRange} />
      <div className="flex gap-2 mb-3 flex-wrap">
        {["All", "Processing", "Dispatched", "Delivered"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className="px-3 py-1.5 rounded-full"
            style={{
              fontSize: 12, fontWeight: 600,
              background: statusFilter === s ? "#0A0A0F" : "#FFFFFF",
              color: statusFilter === s ? "#FFFFFF" : "#0A0A0F",
              border: "1px solid #D1D5DB",
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="card-base p-0 overflow-x-auto">
        <table className="w-full" style={{ fontSize: 13 }}>
          <thead>
            <tr style={{ color: "#4B5563", fontSize: 11, textTransform: "uppercase", textAlign: "left" }}>
              <th className="py-3 px-4"></th>
              <th className="py-3 px-4">Order ID</th><th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Items</th><th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Status</th><th className="py-3 px-4">ETA</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((o) => {
              const isOpen = expanded === o.id;
              return (
                <React.Fragment key={o.id}>
                  <tr key={o.id} style={{ borderTop: "1px solid #E5E7EB", cursor: "pointer" }} onClick={() => setExpanded(isOpen ? null : o.id)}>
                    <td className="py-3 px-4">{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</td>
                    <td className="py-3 px-4" style={{ fontWeight: 600 }}>{o.id}</td>
                    <td className="py-3 px-4" style={{ color: "#4B5563" }}>{o.date}</td>
                    <td className="py-3 px-4">{o.items}</td>
                    <td className="py-3 px-4" style={{ fontWeight: 600 }}>{fmtINR(o.total)}</td>
                    <td className="py-3 px-4"><StatusBadge status={o.status} /></td>
                    <td className="py-3 px-4" style={{ color: "#4B5563" }}>{o.eta}</td>
                  </tr>
                  {isOpen && (
                    <tr key={o.id + "-x"} style={{ background: "#F9FAFB", borderTop: "1px solid #E5E7EB" }}>
                      <td colSpan={7} className="py-4 px-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Btn size="sm" variant="purple" onClick={() => setTrackOrder(o)}><Package size={12} style={{ display: "inline", marginRight: 4 }} /> Track Order</Btn>
                          <Btn size="sm" variant="ghost" onClick={() => setInvoiceOrder(o)}><Receipt size={12} style={{ display: "inline", marginRight: 4 }} /> View Invoice</Btn>
                          <Btn size="sm" variant="ghost" onClick={() => setComplaintOrder(o)}><MessageSquare size={12} style={{ display: "inline", marginRight: 4 }} /> Raise Complaint</Btn>
                          <Btn size="sm" variant="ghost" onClick={() => reorder(o)}><RefreshCw size={12} style={{ display: "inline", marginRight: 4 }} /> Reorder</Btn>
                        </div>
                        {o.status === "Delivered" && (
                          <div className="flex items-center gap-3 p-3 rounded" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>Rate this order:</span>
                            <StarRating onSubmit={(n) => toast.success(`Thanks for the ${n}-star rating!`)} />
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      {complaints.length > 0 && (
        <div className="mt-6">
          <div className="stat-label mb-2">My Complaints</div>
          <div className="card-base p-0 overflow-x-auto">
            <table className="w-full" style={{ fontSize: 13 }}>
              <thead>
                <tr style={{ color: "#4B5563", fontSize: 11, textTransform: "uppercase", textAlign: "left" }}>
                  <th className="py-3 px-4">ID</th><th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Type</th><th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Raised</th><th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                    <td className="py-3 px-4" style={{ fontWeight: 600 }}>{c.id}</td>
                    <td className="py-3 px-4">{c.orderId}</td>
                    <td className="py-3 px-4">{c.type}</td>
                    <td className="py-3 px-4">{c.priority}</td>
                    <td className="py-3 px-4">{c.raised}</td>
                    <td className="py-3 px-4"><StatusBadge status={c.status === "Open" ? "At Risk" : "Good"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {trackOrder && <TrackOrderModal orderId={trackOrder.id} status={trackOrder.status} eta={trackOrder.eta} date={trackOrder.date} onClose={() => setTrackOrder(null)} />}
      {invoiceOrder && <InvoicePanel orderId={invoiceOrder.id} total={invoiceOrder.total} onClose={() => setInvoiceOrder(null)} />}
      {complaintOrder && <ComplaintModal orderId={complaintOrder.id} onClose={() => setComplaintOrder(null)} />}
    </div>
  );
}

/* =================== DEALER: POS (multi-line) =================== */
type PosLine = { sku: string; qty: number; vehicle: string };
type PosBatch = { id: string; date: string; customer: string; phone: string; lines: PosLine[]; notes: string };

export function POSEntry() {
  const today = new Date().toISOString().slice(0, 10);
  const { showLowStockBanner, setShowLowStockBanner } = useApp();
  const [batches, setBatches] = useState<PosBatch[]>([
    { id: "POS-1", date: today, customer: "Walk-in", phone: "", lines: [{ sku: "Amaron Pro 35Ah 4W", qty: 2, vehicle: "Car" }], notes: "" },
  ]);
  const [date, setDate] = useState(today);
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<PosLine[]>([
    { sku: PRODUCTS[0].name, qty: 1, vehicle: "Car" },
  ]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editCustomer, setEditCustomer] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const addLine = () => setLines([...lines, { sku: PRODUCTS[0].name, qty: 1, vehicle: "Car" }]);
  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i));
  const updateLine = (i: number, patch: Partial<PosLine>) => setLines(lines.map((l, idx) => idx === i ? { ...l, ...patch } : l));

  const submit = () => {
    if (lines.length === 0) return toast.error("Add at least one product");
    setBatches([{ id: `POS-${batches.length + 1}`, date, customer: customer || "Walk-in", phone, lines: [...lines], notes }, ...batches]);
    setLines([{ sku: PRODUCTS[0].name, qty: 1, vehicle: "Car" }]);
    setCustomer(""); setPhone(""); setNotes("");
    toast.success("Sales batch logged");
  };

  const startEdit = (b: PosBatch) => { setEditId(b.id); setEditCustomer(b.customer); setEditPhone(b.phone); };
  const saveEdit = (id: string) => {
    setBatches(batches.map((b) => b.id === id ? { ...b, customer: editCustomer || "Walk-in", phone: editPhone } : b));
    setEditId(null);
    toast.success("Batch updated");
  };
  const confirmDelete = (id: string) => {
    setBatches(batches.filter((b) => b.id !== id));
    setDeleteId(null);
    toast.success("Batch deleted");
  };

  const inputStyle = { border: "1px solid #D1D5DB", fontSize: 13, background: "#FFFFFF", padding: "8px 10px", borderRadius: 6 } as const;
  const chartData = [{ d: "Mon", v: 18 }, { d: "Tue", v: 22 }, { d: "Wed", v: 15 }, { d: "Thu", v: 12 }, { d: "Fri", v: 17 }];
  const maxV = 22;

  return (
    <div>
      {showLowStockBanner && (
        <div className="rounded-lg p-3 mb-4 flex items-start gap-3" style={{ background: "#14142A", border: "1px solid #3A3470" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#A78BFA", marginTop: 6, flexShrink: 0 }} />
          <div className="flex-1" style={{ fontSize: 13, color: "#E5E7FF" }}>
            <b>Low stock detected:</b> Amaron Pro 35Ah and Powerzone 45Ah may stock out within 9 to 12 days based on your current sell rate. Log your sales below to keep your forecast accurate.
          </div>
          <button onClick={() => setShowLowStockBanner(false)} aria-label="Close"><X size={16} color="#E5E7FF" /></button>
        </div>
      )}
      <PageHeader title="POS Entry" sub="Log today's secondary sales for Cogniq forecasting" />
      <div className="flex justify-end mb-3">
        <Btn variant="ghost" size="sm" onClick={() => setShowAnalytics((s) => !s)}>
          <BarChart2 size={14} style={{ display: "inline", marginRight: 4 }} /> Sales Analytics
        </Btn>
      </div>
      {showAnalytics && (
        <div className="card-base mb-4">
          <div className="flex justify-between items-start mb-3">
            <div className="stat-label">Sales Analytics</div>
            <Btn variant="ghost" size="sm" onClick={() => setShowAnalytics(false)}>Collapse</Btn>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 11, color: "#6B7280" }}>Best Seller this month</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Amaron Hi-Life 2.5Ah</div>
              <div style={{ fontSize: 12, color: "#4B5563" }}>2,120 units</div>
            </div>
            <div className="p-3 rounded" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 11, color: "#6B7280" }}>This week</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>84</div>
              <div style={{ fontSize: 12, color: "#4B5563" }}>units</div>
            </div>
            <div className="p-3 rounded" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 11, color: "#6B7280" }}>Daily avg</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>16.8</div>
              <div style={{ fontSize: 12, color: "#4B5563" }}>units</div>
            </div>
          </div>
          <div className="flex items-end gap-3" style={{ height: 160 }}>
            {chartData.map((c) => (
              <div key={c.d} className="flex-1 flex flex-col items-center justify-end">
                <div style={{ fontSize: 11, color: "#4B5563", marginBottom: 4 }}>{c.v}</div>
                <div style={{ width: "100%", background: "#C00000", borderRadius: "4px 4px 0 0", height: `${(c.v / maxV) * 120}px` }} />
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 6 }}>{c.d}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <AISuggestions
        items={[
          { text: "Logging POS daily improves your demand forecast accuracy by 22%. You're on a 4-day streak.", action: "Continue" },
          { text: "Customer phone numbers help Cogniq build a repeat-buy timeline. 64% of your customers return within 24 months.", action: "Learn More" },
        ]}
      />
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-base">
          <div className="stat-label mb-3">New sales entry</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="stat-label block mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full" style={inputStyle} />
            </div>
            <div>
              <label className="stat-label block mb-1">Customer Name (optional)</label>
              <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Walk-in" className="w-full" style={inputStyle} />
            </div>
          </div>
          <div className="mb-3">
            <label className="stat-label block mb-1">Phone (optional)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" className="w-full" style={inputStyle} />
          </div>

          <div className="stat-label mb-2">Products & quantities</div>
          <div className="space-y-2 mb-3">
            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <select value={l.sku} onChange={(e) => updateLine(i, { sku: e.target.value })} style={inputStyle} className="col-span-6">
                  {PRODUCTS.map((p) => <option key={p.id}>{p.name}</option>)}
                </select>
                <input type="number" min={1} value={l.qty} onChange={(e) => updateLine(i, { qty: Number(e.target.value) || 1 })} style={inputStyle} className="col-span-2" />
                <select value={l.vehicle} onChange={(e) => updateLine(i, { vehicle: e.target.value })} style={inputStyle} className="col-span-3">
                  <option>Car</option><option>Bike</option><option>Commercial</option><option>UPS</option>
                </select>
                <button onClick={() => removeLine(i)} className="col-span-1" aria-label="Remove line">
                  <Trash2 size={14} color="#C00000" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addLine} className="flex items-center gap-1 mb-3" style={{ fontSize: 13, color: "#5B5BF5", fontWeight: 600 }}>
            <Plus size={14} /> Add another product
          </button>

          <div className="mb-3">
            <label className="stat-label block mb-1">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full" style={inputStyle} />
          </div>
          <Btn onClick={submit}>Submit Sales Batch</Btn>
        </div>

        <div className="card-base p-0 overflow-x-auto">
          <div className="px-4 pt-4 flex justify-between items-center">
            <div className="stat-label">Today's batches ({batches.length})</div>
            <Btn variant="ghost" size="sm" onClick={() => toast.success("Downloading POS_Log_May2026.csv")}>
              <Download size={12} style={{ display: "inline", marginRight: 4 }} /> Export CSV
            </Btn>
          </div>
          <table className="w-full mt-3" style={{ fontSize: 13 }}>
            <thead>
              <tr style={{ color: "#4B5563", fontSize: 11, textTransform: "uppercase", textAlign: "left" }}>
                <th className="py-2 px-4">Batch</th><th className="py-2 px-4">Customer</th>
                <th className="py-2 px-4">Items</th><th className="py-2 px-4">Qty</th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => {
                if (deleteId === b.id) {
                  return (
                    <tr key={b.id} style={{ borderTop: "1px solid #E5E7EB", background: "#FEF2F2" }}>
                      <td className="py-2.5 px-4" colSpan={5}>
                        <div className="flex items-center justify-between gap-3">
                          <span style={{ fontSize: 13, fontWeight: 600 }}>Delete this entry?</span>
                          <div className="flex gap-2">
                            <Btn size="sm" onClick={() => confirmDelete(b.id)}>Yes</Btn>
                            <Btn variant="ghost" size="sm" onClick={() => setDeleteId(null)}>No</Btn>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }
                if (editId === b.id) {
                  return (
                    <tr key={b.id} style={{ borderTop: "1px solid #E5E7EB", background: "#F9FAFB" }}>
                      <td className="py-2.5 px-4" style={{ fontWeight: 600 }}>{b.id}</td>
                      <td className="py-2.5 px-4">
                        <input value={editCustomer} onChange={(e) => setEditCustomer(e.target.value)} placeholder="Customer" style={{ ...inputStyle, padding: "4px 8px" }} className="w-full mb-1" />
                        <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" style={{ ...inputStyle, padding: "4px 8px" }} className="w-full" />
                      </td>
                      <td className="py-2.5 px-4" style={{ fontSize: 12 }}>{b.lines.map((l) => `${l.sku} ×${l.qty}`).join(", ")}</td>
                      <td className="py-2.5 px-4">{b.lines.reduce((s, l) => s + l.qty, 0)}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex gap-1">
                          <Btn size="sm" onClick={() => saveEdit(b.id)}>Save</Btn>
                          <Btn variant="ghost" size="sm" onClick={() => setEditId(null)}>Cancel</Btn>
                        </div>
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={b.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                    <td className="py-2.5 px-4" style={{ fontWeight: 600 }}>{b.id}</td>
                    <td className="py-2.5 px-4">{b.customer}{b.phone && <div style={{ fontSize: 11, color: "#6B7280" }}>{b.phone}</div>}</td>
                    <td className="py-2.5 px-4" style={{ fontSize: 12 }}>
                      {b.lines.map((l, i) => (
                        <div key={i}>{l.sku} ×{l.qty} <span style={{ color: "#6B7280" }}>({l.vehicle})</span></div>
                      ))}
                    </td>
                    <td className="py-2.5 px-4" style={{ fontWeight: 600 }}>{b.lines.reduce((s, l) => s + l.qty, 0)}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(b)} aria-label="Edit"><Pencil size={14} color="#4B5563" /></button>
                        <button onClick={() => setDeleteId(b.id)} aria-label="Delete"><Trash2 size={14} color="#C00000" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =================== ADMIN/RSM: DEALER ORDERS =================== */

type RegOrder = typeof REGIONAL_ORDERS[number];

function OrderDetailDrawer({ order, onClose, onEscalate }: { order: RegOrder; onClose: () => void; onEscalate: () => void }) {
  // synthesize line items from skus string
  const lineItems = order.skus.split(",").map((s) => s.trim()).map((s, i) => {
    const m = s.match(/^(.+?) ×(\d+)$/);
    const name = m ? m[1] : s;
    const qty = m ? Number(m[2]) : 1;
    const unitPrice = Math.round(order.value / Math.max(1, qty * (order.skus.split(",").length))) || 0;
    return { sku: name, qty, unitPrice, total: unitPrice * qty, key: i };
  });
  const eta = (() => {
    const d = order.date.split(" ");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dt = new Date(2026, months.indexOf(d[1]), Number(d[0]) + 4);
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  })();
  return (
    <RightDrawer title="Order Details" sub={order.id} onClose={onClose}>
      <div className="space-y-1 mb-4" style={{ fontSize: 13 }}>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Order ID</span><span style={{ fontWeight: 700 }}>{order.id}</span></div>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Dealer</span><span style={{ fontWeight: 600 }}>{order.dealer}</span></div>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Location</span><span>{order.location}</span></div>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Order Date</span><span>{order.date}</span></div>
        <div className="flex justify-between items-center"><span style={{ color: "#4B5563" }}>Status</span><StatusBadge status={order.status} /></div>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Estimated Delivery</span><span style={{ fontWeight: 600 }}>{eta}</span></div>
      </div>
      <div className="my-4" style={{ borderTop: "1px solid #E5E7EB" }} />
      <div className="stat-label mb-2">Items</div>
      <div className="rounded-lg overflow-hidden mb-4" style={{ border: "1px solid #E5E7EB" }}>
        <table className="w-full" style={{ fontSize: 12 }}>
          <thead style={{ background: "#F9FAFB" }}>
            <tr style={{ color: "#4B5563", textTransform: "uppercase", textAlign: "left" }}>
              <th className="py-2 px-3">SKU</th><th className="py-2 px-3">Qty</th>
              <th className="py-2 px-3">Unit Price</th><th className="py-2 px-3" style={{ textAlign: "right" }}>Line</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((li) => (
              <tr key={li.key} style={{ borderTop: "1px solid #E5E7EB" }}>
                <td className="py-2 px-3">{li.sku}</td>
                <td className="py-2 px-3">{li.qty}</td>
                <td className="py-2 px-3">{fmtINR(li.unitPrice)}</td>
                <td className="py-2 px-3" style={{ textAlign: "right", fontWeight: 600 }}>{fmtINR(li.total)}</td>
              </tr>
            ))}
            <tr style={{ background: "#F9FAFB", borderTop: "1px solid #E5E7EB" }}>
              <td className="py-2 px-3" colSpan={3} style={{ fontWeight: 700 }}>Order Total</td>
              <td className="py-2 px-3" style={{ textAlign: "right", fontWeight: 700 }}>{fmtINR(order.value)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="stat-label mb-2">Status Timeline</div>
      <StageTimeline status={order.status} />
      <ContactDealerCard dealer={order.dealer} location={order.location} />
      <div className="mt-5 flex flex-wrap gap-2">
        <Btn variant="purple" size="sm" onClick={onEscalate}><AlertTriangle size={12} style={{ display: "inline", marginRight: 4 }} /> Escalate</Btn>
        <Btn variant="ghost" size="sm" onClick={() => toast.success(`Calling ${order.dealer}…`)}><Phone size={12} style={{ display: "inline", marginRight: 4 }} /> Call</Btn>
        <Btn variant="ghost" size="sm" onClick={() => toast.success(`Email drafted to ${order.dealer}`)}><Mail size={12} style={{ display: "inline", marginRight: 4 }} /> Email</Btn>
        <Btn variant="ghost" size="sm" onClick={onClose}>Close</Btn>
      </div>
    </RightDrawer>
  );
}

export function DealerOrdersAdmin() {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("30d");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [drawerOrder, setDrawerOrder] = useState<RegOrder | null>(null);
  const [escalateId, setEscalateId] = useState<string | null>(null);
  const { dealerOrdersFilter, setDealerOrdersFilter } = useApp();

  const filtered = REGIONAL_ORDERS.filter((o) =>
    (category === "All" || o.category === category) &&
    (status === "All" || o.status === status) &&
    (search === "" || o.dealer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader title="Dealer Orders" sub="All orders across the channel" />
      {dealerOrdersFilter === "dormant" && (
        <div className="rounded-lg p-3 mb-4 flex items-center justify-between" style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}>
          <div style={{ fontSize: 13, color: "#92400E", fontWeight: 600 }}>
            Showing dormant dealers: no order in 14 days.
          </div>
          <button onClick={() => setDealerOrdersFilter(null)} aria-label="Clear filter"><X size={16} color="#92400E" /></button>
        </div>
      )}
      <AISuggestions
        items={[
          { text: "Order volume from NCR is +23% above 6-month average — consider bulk dispatch slot.", action: "Plan Dispatch" },
          { text: "2 orders are over SLA. Sharma Auto Parts (ORD-9012) and KK Batteries (ORD-9008) need attention.", action: "Resolve" },
          { text: "Powerzone Hummer 65Ah orders trending +18% week-on-week — verify production capacity.", action: "Check Stock" },
        ]}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard label="Orders Today" value="18" change="+4 vs yesterday" accent="crimson" />
        <StatCard label="Total Value Today" value="₹14.6 L" change="+9% vs avg" accent="green" />
        <StatCard label="Pending Dispatch" value="7" change="2 over SLA" accent="amber" />
        <StatCard label="Avg Order Value" value="₹81,300" change="+₹4.2k vs last week" accent="green" />
      </div>
      <FilterBar
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }}
        dateRange={dateRange} onDateRange={setDateRange}
        category={category} onCategory={(v) => { setCategory(v); setPage(1); }}
        categories={["2W", "4W", "Industrial"]}
      />
      <div className="flex gap-2 mb-3 flex-wrap">
        {["All", "Processing", "Dispatched", "Delivered"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className="px-3 py-1.5 rounded-full"
            style={{
              fontSize: 12, fontWeight: 600,
              background: status === s ? "#0A0A0F" : "#FFFFFF",
              color: status === s ? "#FFFFFF" : "#0A0A0F",
              border: "1px solid #D1D5DB",
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="card-base p-0 overflow-x-auto">
        <table className="w-full" style={{ fontSize: 13 }}>
          <thead>
            <tr style={{ color: "#4B5563", fontSize: 11, textTransform: "uppercase", textAlign: "left" }}>
              <th className="py-3 px-4">Dealer</th><th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Order ID</th><th className="py-3 px-4">SKUs</th>
              <th className="py-3 px-4">Value</th><th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date</th><th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((o) => (
              <tr key={o.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                <td className="py-3 px-4" style={{ fontWeight: 600 }}>{o.dealer}</td>
                <td className="py-3 px-4" style={{ color: "#4B5563" }}>{o.location}</td>
                <td className="py-3 px-4">{o.id}</td>
                <td className="py-3 px-4">{o.skus}</td>
                <td className="py-3 px-4" style={{ fontWeight: 600 }}>{fmtINR(o.value)}</td>
                <td className="py-3 px-4"><StatusBadge status={o.status} /></td>
                <td className="py-3 px-4" style={{ color: "#4B5563" }}>{o.date}</td>
                <td className="py-3 px-4"><Btn variant="ghost" size="sm" onClick={() => setDrawerOrder(o)}>View Details</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      {drawerOrder && <OrderDetailDrawer order={drawerOrder} onClose={() => setDrawerOrder(null)} onEscalate={() => setEscalateId(drawerOrder.id)} />}
      {escalateId && <EscalateModal refId={escalateId} kind="Order" onClose={() => setEscalateId(null)} />}
    </div>
  );
}

/* =================== ADMIN/RSM: SECONDARY SALES =================== */
export function SecondarySales() {
  const { setView, setDealerOrdersFilter } = useApp();
  const max = Math.max(...SKU_SELLTHROUGH.map((s) => s.units));
  const [sentRows, setSentRows] = useState<Set<number>>(new Set());
  const [confirmRow, setConfirmRow] = useState<number | null>(null);

  const insightItems = [
    { text: "Amaron Pro 35Ah trending 23% above forecast in NCR. Consider increasing allocation.", action: "Reallocate", onAction: () => setView("dealer-orders") },
    { text: "14 dealers in Maharashtra have not logged POS data in 7 days. Follow-up recommended.", action: "View Dormant", onAction: () => { setDealerOrdersFilter("dormant"); setView("dealer-orders"); } },
    { text: "Powerzone 45Ah stock-out predicted in Tamil Nadu within 12 days at current sell rate.", action: "Alert Dealers", onAction: () => { const el = document.getElementById("stockout-section"); el?.scrollIntoView({ behavior: "smooth" }); } },
    { text: "AmaronVolt 200Ah pickup is +18% in industrial segment — coordinate with IAM team.", action: "Notify IAM" },
  ];

  return (
    <div>
      <PageHeader title="Secondary Sales Intelligence" sub="POS data, sell-through and predictive stock-out alerts" />
      <AISuggestions items={insightItems} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard label="POS Entries This Week" value="1,284" change="+11% vs last week" accent="green" />
        <StatCard label="Top Selling SKU" value="Amaron Hi-Life" change="2,120 units" accent="crimson" />
        <StatCard label="Dormant Dealers (14d)" value="14" change="Follow-up needed" accent="amber" onClick={() => { setDealerOrdersFilter("dormant"); setView("dealer-orders"); }} />
        <StatCard label="Stock-out Alerts" value="6" change="Predicted < 14 days" accent="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-5">
        <div className="card-base">
          <div className="stat-label mb-3">SKU sell-through (this month)</div>
          <div className="space-y-3">
            {SKU_SELLTHROUGH.map((s) => (
              <div key={s.sku}>
                <div className="flex justify-between" style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 500 }}>{s.sku}</span><span style={{ color: "#4B5563" }}>{s.units.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-2 rounded-full mt-1.5" style={{ background: "#E5E7EB" }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${(s.units / max) * 100}%`, background: s.type === "auto" ? "#C00000" : "#00A651" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card-base">
          <div className="stat-label mb-3">Dealer activity by region</div>
          <div className="space-y-2">
            {REGIONS.map((r) => (
              <div key={r.name} className="flex items-center justify-between py-2"
                style={{ borderBottom: "1px solid #E5E7EB" }}>
                <div className="flex items-center gap-2">
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: r.activity === "high" ? "#00A651" : r.activity === "medium" ? "#EF9F27" : "#C00000",
                  }} />
                  <span style={{ fontSize: 14 }}>{r.name}</span>
                </div>
                <span style={{ fontSize: 11, color: "#4B5563", textTransform: "uppercase", fontWeight: 600 }}>{r.activity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="stockout-section" className="card-base p-0 overflow-x-auto">
        <div className="px-4 pt-4 stat-label">Stock-out Alerts</div>
        <table className="w-full mt-3" style={{ fontSize: 13 }}>
          <thead>
            <tr style={{ color: "#4B5563", fontSize: 11, textTransform: "uppercase", textAlign: "left" }}>
              <th className="py-2 px-4">Dealer</th><th className="py-2 px-4">Region</th>
              <th className="py-2 px-4">SKU</th><th className="py-2 px-4">Days to Stock-out</th>
              <th className="py-2 px-4">Current Stock</th><th className="py-2 px-4">Reorder Qty</th><th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {STOCKOUT_ALERTS.map((a, i) => (
              <tr key={i} style={{ borderTop: "1px solid #E5E7EB" }}>
                <td className="py-3 px-4" style={{ fontWeight: 600 }}>{a.dealer}</td>
                <td className="py-3 px-4" style={{ color: "#4B5563" }}>{a.region}</td>
                <td className="py-3 px-4">{a.sku}</td>
                <td className="py-3 px-4"><span className="badge-risk" style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11 }}>{a.days} days</span></td>
                <td className="py-3 px-4">{a.current}</td>
                <td className="py-3 px-4" style={{ fontWeight: 600 }}>{a.reorder}</td>
                <td className="py-3 px-4">
                  {sentRows.has(i) ? (
                    <span className="badge-good" style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>Alert Sent</span>
                  ) : (
                    <Btn size="sm" onClick={() => setConfirmRow(i)}>Send Alert</Btn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {confirmRow !== null && (
        <ConfirmDialog
          title="Send stock-out alert"
          body={<>Send stock-out alert to <strong>{STOCKOUT_ALERTS[confirmRow].dealer}</strong> for <strong>{STOCKOUT_ALERTS[confirmRow].sku}</strong>?</>}
          confirmLabel="Send Alert"
          onCancel={() => setConfirmRow(null)}
          onConfirm={() => {
            setSentRows((prev) => new Set(prev).add(confirmRow));
            setConfirmRow(null);
            toast.success("Alert sent");
          }}
        />
      )}
    </div>
  );
}

/* =================== ADMIN: GLOBAL DASHBOARD =================== */
export function AdminDashboard() {
  const { setView } = useApp();
  return (
    <div>
      <PageHeader title="Cognilix Dashboard" sub="Unified demand and channel intelligence" />
      <AISuggestions
        items={[
          { text: "NCR demand for Amaron Pro 35Ah trending 23% above forecast — consider stock reallocation.", action: "Reallocate", onAction: () => setView("dealer-orders") },
          { text: "Indus Towers contract INDT-2024-002 will exhaust 3 weeks before expiry at current rate.", action: "Review", onAction: () => setView("contracts") },
          { text: "8 sites at Critical risk — total 32 units; estimated 30-day replacement value ₹6.8 L.", action: "View Pipeline", onAction: () => setView("fleet-health") },
          { text: "₹38.6 L 90-day replacement pipeline across 47 units — schedule customer reviews this week.", action: "Schedule" },
        ]}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard label="Active Dealers" value="312" change="+6 this month" accent="crimson" onClick={() => setView("dealer-orders")} />
        <StatCard label="Orders Today" value="18" change="+4 vs yesterday" accent="green" onClick={() => setView("dealer-orders")} />
        <StatCard label="Fleet Sites at Risk" value="8" change="Across 3 customers" accent="amber" onClick={() => setView("fleet-health")} />
        <StatCard label="Contracts Expiring (60d)" value="3" change="₹2.34 Cr at risk" accent="amber" onClick={() => setView("contracts")} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4 mb-5">
        <div className="card-base" style={{ borderTop: "3px solid #C00000" }}>
          <div className="stat-label mb-3">Dealer channel — top regions</div>
          <div className="space-y-2.5">
            {[
              { r: "NCR", v: "₹4.82 Cr" },
              { r: "Tamil Nadu", v: "₹3.41 Cr" },
              { r: "Maharashtra", v: "₹2.94 Cr" },
              { r: "Karnataka", v: "₹2.10 Cr" },
              { r: "Telangana", v: "₹1.55 Cr" },
            ].map((x, i) => (
              <div key={i} className="flex justify-between py-2" style={{ fontSize: 14, borderBottom: "1px solid #E5E7EB" }}>
                <span>{x.r}</span><span style={{ fontWeight: 600 }}>{x.v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-base" style={{ borderTop: "3px solid #00A651" }}>
          <div className="stat-label mb-3">Industrial — customer mix</div>
          <div className="space-y-3">
            {[
              { c: "Indus Towers", v: "₹3.62 Cr", share: 56 },
              { c: "BSNL", v: "₹1.94 Cr", share: 30 },
              { c: "Hitachi UPS Solutions", v: "₹0.85 Cr", share: 14 },
            ].map((x, i) => (
              <div key={i}>
                <div className="flex justify-between" style={{ fontSize: 14 }}>
                  <span>{x.c}</span><span style={{ fontWeight: 600 }}>{x.v}</span>
                </div>
                <div className="h-2 rounded-full mt-1.5" style={{ background: "#E5E7EB" }}>
                  <div className="h-full rounded-full" style={{ width: `${x.share}%`, background: "#00A651" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =================== RSM DASHBOARD =================== */
const RSM_DEALERS = [
  { id: "D1", name: "Sharma Auto Parts", city: "Delhi", mtd: 184000, target: 250000, lastOrder: "9 days ago", status: "Dormant" },
  { id: "D2", name: "Verma Battery House", city: "Gurgaon", mtd: 412000, target: 350000, lastOrder: "Today", status: "Active" },
  { id: "D3", name: "Singh Motors", city: "Noida", mtd: 298000, target: 300000, lastOrder: "2 days ago", status: "Active" },
  { id: "D4", name: "Kapoor Spares", city: "Faridabad", mtd: 156000, target: 220000, lastOrder: "5 days ago", status: "Active" },
  { id: "D5", name: "Bharat Auto", city: "Ghaziabad", mtd: 92000, target: 200000, lastOrder: "11 days ago", status: "Dormant" },
  { id: "D6", name: "Royal Battery", city: "Meerut", mtd: 367000, target: 320000, lastOrder: "1 day ago", status: "Active" },
];

function ScheduleVisitModal({ dealer, onClose }: { dealer: { name: string; city: string }; onClose: () => void }) {
  const [date, setDate] = useState("");
  const [purpose, setPurpose] = useState("Quarterly review");
  const [done, setDone] = useState(false);
  const inp = { border: "1px solid #D1D5DB", fontSize: 13, padding: "8px 10px", borderRadius: 6, width: "100%" } as const;
  return (
    <CenterModal widthClass="max-w-md">
      <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid #E5E7EB" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Schedule Visit — {dealer.name}</h3>
        <button onClick={onClose}><X size={18} /></button>
      </div>
      <div className="p-5">
        {done ? (
          <div className="text-center py-3">
            <CheckCircle2 size={48} color="#15803D" style={{ margin: "0 auto" }} />
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 12 }}>Visit scheduled for {date}</div>
            <div style={{ fontSize: 13, color: "#4B5563", marginTop: 6 }}>{dealer.name} · {dealer.city} — {purpose}</div>
            <div className="mt-5"><Btn onClick={onClose}>Close</Btn></div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="space-y-3">
            <div><label className="stat-label block mb-1">Visit Date</label><input type="date" required value={date} onChange={(e) => setDate(e.target.value)} style={inp} /></div>
            <div><label className="stat-label block mb-1">Purpose</label>
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={inp}>
                <option>Quarterly review</option><option>New product launch</option><option>Reactivation visit</option><option>Training</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="ghost" size="sm" onClick={onClose}>Cancel</Btn>
              <Btn type="submit">Schedule</Btn>
            </div>
          </form>
        )}
      </div>
    </CenterModal>
  );
}

export function RSMDashboard() {
  const { setView, setDealerOrdersFilter } = useApp();
  const [visitDealer, setVisitDealer] = useState<typeof RSM_DEALERS[number] | null>(null);
  const [posDealer, setPosDealer] = useState<typeof RSM_DEALERS[number] | null>(null);
  const [priorityIds, setPriorityIds] = useState<string[]>([]);
  const togglePriority = (id: string) => setPriorityIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const posSample = [
    { date: "14 May 2026", product: "Amaron Pro 35Ah", qty: 4 },
    { date: "12 May 2026", product: "Amaron Pro 35Ah", qty: 2 },
    { date: "09 May 2026", product: "Amaron Hi-Life 2.5Ah", qty: 6 },
    { date: "06 May 2026", product: "Powerzone 45Ah", qty: 3 },
    { date: "03 May 2026", product: "Amaron Pro 35Ah", qty: 5 },
  ];

  return (
    <div>
      <PageHeader title="My Region — NCR & North India" sub="Dealer performance, demand trends, and Cogniq recommendations" />
      <AISuggestions
        items={[
          { text: "Sharma Auto Parts (Delhi) — 9 days dormant, projected stock-out on Amaron Pro 35Ah in 9 days. ₹1.68 L at risk.", action: "Call Dealer" },
          { text: "Amaron Pro 35Ah sell-through in NCR is 84% — 23% above national average.", action: "View Trend" },
          { text: "3 new dealers onboarded this month — schedule first-order training.", action: "Schedule" },
        ]}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard label="Active Dealers" value="42" change="3 new this month" accent="crimson" onClick={() => setView("dealer-orders")} />
        <StatCard label="Region Sales (MTD)" value="₹4.82 Cr" change="+14% vs last month" accent="green" onClick={() => setView("secondary-sales")} />
        <StatCard label="Dormant Dealers" value="6" change="No order > 7 days" accent="amber" onClick={() => { setDealerOrdersFilter("dormant"); setView("dealer-orders"); }} />
        <StatCard label="Stock-out Alerts" value="2" change="Within 12 days" accent="amber" onClick={() => setView("secondary-sales")} />
      </div>

      <div className="rounded-lg mb-5" style={{ border: "1px solid #E5E7EB", background: "#FFFFFF" }}>
        <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: "1px solid #E5E7EB" }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Dealer Performance</h3>
            <div style={{ fontSize: 12, color: "#4B5563" }}>MTD sales vs target — click a dealer to schedule a visit or flag as priority</div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: 12 }}>
            <thead style={{ background: "#F9FAFB" }}>
              <tr style={{ color: "#4B5563", textTransform: "uppercase", textAlign: "left" }}>
                <th className="py-2 px-3">Dealer</th><th className="py-2 px-3">City</th>
                <th className="py-2 px-3">MTD</th><th className="py-2 px-3" style={{ minWidth: 140 }}>Target Achievement</th>
                <th className="py-2 px-3">Last Order</th><th className="py-2 px-3">Status</th><th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {RSM_DEALERS.map((d) => {
                const pct = Math.min(100, Math.round((d.mtd / d.target) * 100));
                const isPri = priorityIds.includes(d.id);
                return (
                  <tr key={d.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                    <td className="py-2 px-3" style={{ fontWeight: 600 }}>
                      {isPri && <span style={{ color: "#C00000", marginRight: 4 }}>★</span>}{d.name}
                    </td>
                    <td className="py-2 px-3" style={{ color: "#4B5563" }}>{d.city}</td>
                    <td className="py-2 px-3">₹{(d.mtd / 1000).toFixed(0)}k</td>
                    <td className="py-2 px-3">
                      <div className="h-2 rounded-full" style={{ background: "#E5E7EB" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 100 ? "#00A651" : pct >= 70 ? "#EF9F27" : "#C00000" }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#4B5563", marginTop: 2 }}>{pct}% of ₹{(d.target / 1000).toFixed(0)}k</div>
                    </td>
                    <td className="py-2 px-3" style={{ color: d.status === "Dormant" ? "#C00000" : "#4B5563" }}>{d.lastOrder}</td>
                    <td className="py-2 px-3"><StatusBadge status={d.status} /></td>
                    <td className="py-2 px-3">
                      <div className="flex gap-1 flex-wrap">
                        <Btn size="sm" variant="ghost" onClick={() => setView("dealer-orders")}>Orders</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => setPosDealer(d)}>POS</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => setVisitDealer(d)}>Visit</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => togglePriority(d.id)}>{isPri ? "Unflag" : "Flag"}</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SecondarySales />
      {visitDealer && <ScheduleVisitModal dealer={visitDealer} onClose={() => setVisitDealer(null)} />}
      {posDealer && (
        <CenterModal widthClass="max-w-lg">
          <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid #E5E7EB" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>POS History: {posDealer.name}</h3>
            <button onClick={() => setPosDealer(null)}><X size={18} /></button>
          </div>
          <div className="p-5">
            <table className="w-full" style={{ fontSize: 13 }}>
              <thead style={{ background: "#F9FAFB" }}>
                <tr style={{ color: "#4B5563", fontSize: 11, textTransform: "uppercase", textAlign: "left" }}>
                  <th className="py-2 px-3">Date</th><th className="py-2 px-3">Product</th><th className="py-2 px-3">Total Qty</th>
                </tr>
              </thead>
              <tbody>
                {posSample.map((p, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #E5E7EB" }}>
                    <td className="py-2 px-3" style={{ color: "#4B5563" }}>{p.date}</td>
                    <td className="py-2 px-3">{p.product}</td>
                    <td className="py-2 px-3" style={{ fontWeight: 600 }}>{p.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end pt-4"><Btn onClick={() => setPosDealer(null)}>Close</Btn></div>
          </div>
        </CenterModal>
      )}
    </div>
  );
}

/* =================== INDUSTRIAL CUSTOMER: MY SITES =================== */

function ServiceRequestModal({ siteName, unitId, onClose }: { siteName: string; unitId: string; onClose: () => void }) {
  const [type, setType] = useState("Inspection");
  const [priority, setPriority] = useState("Normal");
  const [desc, setDesc] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const { addServiceRequest } = useApp();
  const inputStyle = { border: "1px solid #D1D5DB", fontSize: 13, background: "#FFFFFF", padding: "8px 10px", borderRadius: 6, width: "100%" } as const;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = "SR-" + Math.floor(1000 + Math.random() * 9000);
    addServiceRequest({ id, siteName, unitId, type, priority, description: desc, ts: Date.now() });
    setSubmitted(id);
  };

  return (
    <CenterModal widthClass="max-w-md">
      <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid #E5E7EB" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Raise Service Request</h3>
        <button onClick={onClose}><X size={18} /></button>
      </div>
      <div className="p-5">
        {submitted ? (
          <div className="text-center py-3">
            <CheckCircle2 size={48} color="#15803D" style={{ margin: "0 auto" }} />
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 12 }}>
              Service Request {submitted} submitted successfully.
            </div>
            <div style={{ fontSize: 13, color: "#4B5563", marginTop: 8 }}>
              Our team will contact you within 24 hours.
            </div>
            <div className="mt-5">
              <Btn onClick={onClose}>Close</Btn>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="stat-label block mb-1">Site Name</label>
              <input value={siteName} readOnly style={{ ...inputStyle, background: "#F3F4F6" }} />
            </div>
            <div>
              <label className="stat-label block mb-1">Unit ID</label>
              <input value={unitId} readOnly style={{ ...inputStyle, background: "#F3F4F6" }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="stat-label block mb-1">Request Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                  <option>Inspection</option><option>Replacement</option><option>Emergency</option>
                </select>
              </div>
              <div>
                <label className="stat-label block mb-1">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
                  <option>Normal</option><option>High</option><option>Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="stat-label block mb-1">Description</label>
              <textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} style={inputStyle} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="ghost" size="sm" onClick={onClose}>Cancel</Btn>
              <Btn type="submit">Submit</Btn>
            </div>
          </form>
        )}
      </div>
    </CenterModal>
  );
}

function UnitsTable({ siteId, onRaise }: { siteId: string; onRaise: (unitId: string) => void }) {
  const units = SITE_UNITS[siteId] ?? [];
  return (
    <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid #E5E7EB" }}>
      <table className="w-full" style={{ fontSize: 12 }}>
        <thead style={{ background: "#F9FAFB" }}>
          <tr style={{ color: "#4B5563", textTransform: "uppercase", textAlign: "left" }}>
            <th className="py-2 px-3">Unit ID</th><th className="py-2 px-3">Model</th>
            <th className="py-2 px-3">Installed</th><th className="py-2 px-3">Age</th>
            <th className="py-2 px-3" style={{ minWidth: 140 }}>Life Used</th>
            <th className="py-2 px-3">Status</th><th className="py-2 px-3"></th>
          </tr>
        </thead>
        <tbody>
          {units.map((u) => (
            <tr key={u.unitId} style={{ borderTop: "1px solid #E5E7EB" }}>
              <td className="py-2 px-3" style={{ fontWeight: 600 }}>{u.unitId}</td>
              <td className="py-2 px-3">{u.model}</td>
              <td className="py-2 px-3" style={{ color: "#4B5563" }}>{u.installed}</td>
              <td className="py-2 px-3">{u.ageMonths} mo</td>
              <td className="py-2 px-3">
                <div className="h-2 rounded-full" style={{ background: "#E5E7EB" }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${u.lifeUsed}%`, background: u.lifeUsed > 80 ? "#C00000" : u.lifeUsed > 60 ? "#EF9F27" : "#00A651" }} />
                </div>
                <div style={{ fontSize: 10, color: "#4B5563", marginTop: 2 }}>{u.lifeUsed}%</div>
              </td>
              <td className="py-2 px-3"><StatusBadge status={u.status} /></td>
              <td className="py-2 px-3"><Btn size="sm" onClick={() => onRaise(u.unitId)}>Raise SR</Btn></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MySites() {
  const [openSiteId, setOpenSiteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [srUnit, setSrUnit] = useState<{ siteName: string; unitId: string } | null>(null);
  const totalUnits = SITES.reduce((s, x) => s + x.units, 0);
  const atRisk = SITES.filter((s) => s.status === "At Risk").reduce((s, x) => s + x.units, 0);
  const critical = SITES.filter((s) => s.status === "Critical").reduce((s, x) => s + x.units, 0);

  const filtered = SITES.filter((s) => statusFilter === "All" || s.status === statusFilter);

  if (openSiteId) {
    const site = SITES.find((s) => s.id === openSiteId)!;
    const units = SITE_UNITS[openSiteId] ?? [];
    const siteCritical = units.filter((u) => u.status === "Critical").length;
    const siteRisk = units.filter((u) => u.status === "At Risk").length;
    return (
      <div>
        <button onClick={() => setOpenSiteId(null)} className="flex items-center gap-1.5 mb-3" style={{ fontSize: 13, color: "#2B31B8", fontWeight: 600 }}>
          <ArrowLeft size={14} /> Back to My Sites
        </button>
        <PageHeader title={site.name} sub={`${site.id} · ${site.location}`} />
        <div className="flex items-center gap-3 mb-4">
          <StatusBadge status={site.status} />
          <span style={{ fontSize: 13, color: "#4B5563" }}>Last inspection: {site.lastInspection}</span>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <StatCard label="Total Units" value={String(units.length)} accent="green" />
          <StatCard label="At Risk Units" value={String(siteRisk)} accent="amber" />
          <StatCard label="Critical Units" value={String(siteCritical)} accent="crimson" />
        </div>
        <div className="card-base p-4">
          <div className="stat-label mb-3">Battery Units</div>
          <UnitsTable siteId={openSiteId} onRaise={(unitId) => setSrUnit({ siteName: site.name, unitId })} />
        </div>
        {srUnit && <ServiceRequestModal siteName={srUnit.siteName} unitId={srUnit.unitId} onClose={() => setSrUnit(null)} />}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My Fleet Overview" sub="Indus Towers — battery health across all sites" />
      <AISuggestions
        items={[
          { text: "Tower Site NCR-041 has 6 critical units (88% avg life used). Inspection recommended within 14 days.", action: "View Site", onAction: () => setOpenSiteId("NCR-041") },
          { text: "INDT-2024-002 contract has only 20 units left — projected to exhaust 3 weeks before expiry (30 Jun).", action: "Plan Renewal" },
          { text: "MH-117 and KA-052 (8 units) showing degradation patterns — schedule joint inspection.", action: "Schedule" },
        ]}
      />
      <div className="grid grid-cols-3 gap-4 mb-5">
        <StatCard label="Total Battery Units" value={String(totalUnits)} change={`${SITES.length} sites`} accent="green" />
        <StatCard label="Units at Risk" value={String(atRisk)} change="Inspection within 30 days" accent="amber" />
        <StatCard label="Critical Units" value={String(critical)} change="Replace immediately" accent="crimson" />
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["All", "Critical", "At Risk", "Good"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="px-3 py-1.5 rounded-full"
            style={{
              fontSize: 12, fontWeight: 600,
              background: statusFilter === s ? "#0A0A0F" : "#FFFFFF",
              color: statusFilter === s ? "#FFFFFF" : "#0A0A0F",
              border: "1px solid #D1D5DB",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {filtered.map((s) => (
          <div key={s.id} className="card-base" style={{
            borderTop: `3px solid ${s.status === "Critical" ? "#C00000" : s.status === "At Risk" ? "#EF9F27" : "#00A651"}`,
          }}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: "#4B5563" }}>{s.id} · {s.location}</div>
              </div>
              <StatusBadge status={s.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <div className="stat-label">Units</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{s.units}</div>
              </div>
              <div>
                <div className="stat-label">Last Inspection</div>
                <div style={{ fontSize: 14 }}>{s.lastInspection}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between mb-1.5" style={{ fontSize: 11, color: "#4B5563", fontWeight: 600 }}>
                <span>LIFE REMAINING</span><span>{s.lifeLeft}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "#E5E7EB" }}>
                <div className="h-full rounded-full"
                  style={{ width: `${s.lifeLeft}%`, background: s.lifeLeft < 30 ? "#C00000" : s.lifeLeft < 60 ? "#EF9F27" : "#00A651" }} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Btn variant="ghost" size="sm" onClick={() => setOpenSiteId(s.id)}>View Details</Btn>
              <Btn variant="crimson" size="sm" onClick={() => setSrUnit({ siteName: s.name, unitId: (SITE_UNITS[s.id] ?? [{ unitId: s.id + "-01" }])[0].unitId })}>Raise Service Request</Btn>
            </div>
          </div>
        ))}
      </div>

      {srUnit && <ServiceRequestModal siteName={srUnit.siteName} unitId={srUnit.unitId} onClose={() => setSrUnit(null)} />}
    </div>
  );
}

/* =================== IAM: FLEET HEALTH =================== */

function ReplacementPipelineModal({ onClose }: { onClose: () => void }) {
  const rows = Object.entries(SITE_UNITS).flatMap(([siteId, units]) => {
    const due = units.filter((u) => u.lifeUsed >= 80);
    if (due.length === 0) return [];
    const customer = ALL_FLEET_SITES.find((s) => s.site === siteId)?.customer ?? "Indus Towers";
    const model = due[0].model;
    const unitPrice = model.includes("AmaronVolt") ? 22000 : model.includes("Quanta 150") ? 17500 : 14200;
    const date = new Date(Date.now() + (Math.floor(Math.random() * 50) + 10) * 86400000).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    return [{ siteId, customer, model, units: due.length, date, value: due.length * unitPrice }];
  });
  const total = rows.reduce((s, r) => s + r.value, 0);
  return (
    <CenterModal widthClass="max-w-2xl">
      <div className="px-5 py-4 flex justify-between items-start" style={{ borderBottom: "1px solid #E5E7EB", background: "#EEF0FF" }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>60-Day Replacement Pipeline</h3>
          <div style={{ fontSize: 12, color: "#4B5563", marginTop: 2 }}>Units with ≥80% life used across managed sites.</div>
        </div>
        <button onClick={onClose}><X size={18} /></button>
      </div>
      <div className="p-5 overflow-y-auto">
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
          <table className="w-full" style={{ fontSize: 12 }}>
            <thead style={{ background: "#F9FAFB" }}>
              <tr style={{ color: "#4B5563", textTransform: "uppercase", textAlign: "left" }}>
                <th className="py-2 px-3">Site ID</th><th className="py-2 px-3">Customer</th>
                <th className="py-2 px-3">Model</th><th className="py-2 px-3">Units Due</th>
                <th className="py-2 px-3">Est. Date</th><th className="py-2 px-3" style={{ textAlign: "right" }}>Est. Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.siteId} style={{ borderTop: "1px solid #E5E7EB" }}>
                  <td className="py-2 px-3" style={{ fontWeight: 600 }}>{r.siteId}</td>
                  <td className="py-2 px-3">{r.customer}</td>
                  <td className="py-2 px-3">{r.model}</td>
                  <td className="py-2 px-3">{r.units}</td>
                  <td className="py-2 px-3">{r.date}</td>
                  <td className="py-2 px-3" style={{ textAlign: "right", fontWeight: 600 }}>{fmtINR(r.value)}</td>
                </tr>
              ))}
              <tr style={{ background: "#F9FAFB", borderTop: "1px solid #E5E7EB" }}>
                <td className="py-2 px-3" colSpan={5} style={{ fontWeight: 700 }}>Total Pipeline</td>
                <td className="py-2 px-3" style={{ textAlign: "right", fontWeight: 700 }}>{fmtINRLakh(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="px-5 py-3 flex justify-end" style={{ borderTop: "1px solid #E5E7EB", background: "#F9FAFB" }}>
        <Btn variant="ghost" size="sm" onClick={onClose}>Close</Btn>
      </div>
    </CenterModal>
  );
}

export function IAMFleetHealth() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [drawerSite, setDrawerSite] = useState<typeof ALL_FLEET_SITES[number] | null>(null);
  const [srUnit, setSrUnit] = useState<{ siteName: string; unitId: string } | null>(null);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const { selectedCustomer, setSelectedCustomer } = useApp();

  const customers = useMemo(() => Array.from(new Set(ALL_FLEET_SITES.map((s) => s.customer))), []);
  const [customer, setCustomer] = useState("All");

  const effectiveCustomer = selectedCustomer ?? (customer === "All" ? null : customer);

  const filtered = ALL_FLEET_SITES.filter((s) =>
    (effectiveCustomer === null || s.customer === effectiveCustomer) &&
    (search === "" || s.site.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const total = ALL_FLEET_SITES.length;
  const critical = ALL_FLEET_SITES.filter((s) => s.status === "Critical").length;
  const risk = ALL_FLEET_SITES.filter((s) => s.status === "At Risk").length;

  return (
    <div>
      <PageHeader title="Fleet Health" sub="All managed sites across your industrial customers" />
      <AISuggestions
        items={[
          { text: "14 units across 6 sites are predicted to require replacement within 60 days. Estimated value: ₹12.4 L.", action: "View Pipeline", onAction: () => setPipelineOpen(true) },
          { text: "Indus Towers NCR-041 and BSNL BSNL-KA-09 are Critical — combined 16 units due in 30 days.", action: "Schedule Visit" },
          { text: "47 units forecast for 90-day replacement (₹38.6 L) — align with procurement cycle.", action: "Sync Procurement" },
        ]}
      />
      <div className="mb-4">
        <button onClick={() => setPipelineOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: "#2B31B8", color: "#FFFFFF", fontSize: 13, fontWeight: 600 }}>
          <Package size={14} /> Replacement Pipeline
        </button>
      </div>
      {selectedCustomer && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ background: "#EEF0FF", border: "1px solid #C7CCF7", fontSize: 12, fontWeight: 600, color: "#2B31B8" }}>
          Filtered by: {selectedCustomer}
          <button onClick={() => setSelectedCustomer(null)} aria-label="Clear filter"><X size={14} /></button>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Sites Managed" value={String(total)} change="3 customers" accent="green" />
        <StatCard label="Critical Sites" value={String(critical)} change="Action required" accent="crimson" />
        <StatCard label="At Risk Sites" value={String(risk)} change="Inspect within 30 days" accent="amber" />
        <StatCard label="Replacement Pipeline" value="₹12.4 L" change="60-day forecast" accent="amber" onClick={() => setPipelineOpen(true)} />
      </div>
      <FilterBar
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }}
        category={selectedCustomer ?? customer} onCategory={(v) => { setSelectedCustomer(null); setCustomer(v); setPage(1); }}
        categories={customers}
      />
      <div className="card-base p-0 overflow-x-auto mb-3">
        <table className="w-full" style={{ fontSize: 13 }}>
          <thead>
            <tr style={{ color: "#4B5563", fontSize: 11, textTransform: "uppercase", textAlign: "left" }}>
              <th className="py-3 px-4">Customer</th><th className="py-3 px-4">Site</th>
              <th className="py-3 px-4">Location</th><th className="py-3 px-4">Units</th>
              <th className="py-3 px-4">Status</th><th className="py-3 px-4">Days Since Inspection</th>
              <th className="py-3 px-4">Risk</th><th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((s, i) => (
              <tr key={i} style={{ borderTop: "1px solid #E5E7EB" }}>
                <td className="py-3 px-4" style={{ fontWeight: 600 }}>{s.customer}</td>
                <td className="py-3 px-4">{s.site}</td>
                <td className="py-3 px-4" style={{ color: "#4B5563" }}>{s.location}</td>
                <td className="py-3 px-4">{s.units}</td>
                <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                <td className="py-3 px-4">{s.days}</td>
                <td className="py-3 px-4"><StatusBadge status={s.risk} /></td>
                <td className="py-3 px-4"><Btn variant="ghost" size="sm" onClick={() => setDrawerSite(s)}>View Details</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      {drawerSite && (
        <RightDrawer
          title={`${drawerSite.site} — Battery Units`}
          sub={`${drawerSite.customer} · ${drawerSite.location}`}
          onClose={() => setDrawerSite(null)}
        >
          <div className="flex items-center gap-2 mb-4">
            <StatusBadge status={drawerSite.status} />
            <span style={{ fontSize: 12, color: "#4B5563" }}>Risk: {drawerSite.risk} · Days since inspection: {drawerSite.days}</span>
          </div>
          {SITE_UNITS[drawerSite.site] ? (
            <UnitsTable siteId={drawerSite.site} onRaise={(unitId) => setSrUnit({ siteName: drawerSite.site, unitId })} />
          ) : (
            <div className="p-4 rounded" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: 13, color: "#4B5563" }}>
              Unit-level data is being sync'd from the field. {drawerSite.units} units installed.
              <div className="mt-3">
                <Btn size="sm" onClick={() => setSrUnit({ siteName: drawerSite.site, unitId: drawerSite.site + "-01" })}>Raise Service Request</Btn>
              </div>
            </div>
          )}
          <div className="mt-5">
            <Btn variant="ghost" size="sm" onClick={() => setDrawerSite(null)}>Close</Btn>
          </div>
        </RightDrawer>
      )}

      {srUnit && <ServiceRequestModal siteName={srUnit.siteName} unitId={srUnit.unitId} onClose={() => setSrUnit(null)} />}
      {pipelineOpen && <ReplacementPipelineModal onClose={() => setPipelineOpen(false)} />}
    </div>
  );
}

/* =================== IAM: CUSTOMERS DASHBOARD =================== */
export function IAMCustomers() {
  const { setView, setSelectedCustomer } = useApp();
  return (
    <div>
      <PageHeader title="My Customers" sub="Indus Towers · BSNL · Hitachi UPS Solutions" />
      <AISuggestions
        items={[
          { text: "Indus Towers contract INDT-2024-002 expiring in 46 days — propose renewal this week.", action: "Draft Renewal" },
          { text: "BSNL BSNL-KA-09 has 6 critical units — schedule joint inspection.", action: "Schedule" },
          { text: "Hitachi utilisation only 31% on HUS-2025-007 — book usage review.", action: "Book Review" },
          { text: "60-day replacement pipeline of ₹12.4 L — coordinate with procurement.", action: "View Pipeline", onAction: () => setView("fleet-health") },
        ]}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard label="Customers" value="3" change="All active" accent="green" />
        <StatCard label="Active Sites" value="12" change="2 critical" accent="crimson" />
        <StatCard label="Active Contracts" value="6" change="1 expiring < 60d" accent="amber" />
        <StatCard label="60-day Pipeline" value="₹12.4 L" change="14 units" accent="amber" />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-5">
        {[
          { c: "Indus Towers", sites: 6, units: 33, contracts: 3, status: "Critical" },
          { c: "BSNL", sites: 3, units: 31, contracts: 2, status: "Critical" },
          { c: "Hitachi UPS Solutions", sites: 3, units: 18, contracts: 1, status: "At Risk" },
        ].map((x) => (
          <div key={x.c} className="card-base" style={{
            borderTop: `3px solid ${x.status === "Critical" ? "#C00000" : "#EF9F27"}`,
          }}>
            <div className="flex justify-between items-start">
              <div style={{ fontSize: 16, fontWeight: 600 }}>{x.c}</div>
              <StatusBadge status={x.status} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div><div className="stat-label">Sites</div><div style={{ fontSize: 22, fontWeight: 700 }}>{x.sites}</div></div>
              <div><div className="stat-label">Units</div><div style={{ fontSize: 22, fontWeight: 700 }}>{x.units}</div></div>
              <div><div className="stat-label">Contracts</div><div style={{ fontSize: 22, fontWeight: 700 }}>{x.contracts}</div></div>
            </div>
            <div className="mt-4 flex gap-2">
              <Btn variant="ghost" size="sm" onClick={() => { setSelectedCustomer(x.c); setView("fleet-health"); }}>View Fleet</Btn>
              <Btn size="sm" onClick={() => { setSelectedCustomer(x.c); setView("contracts"); }}>View Contracts</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =================== INDUSTRIAL CUSTOMER: MY CONTRACTS =================== */

function sampleReleaseOrdersFor(contractId: string) {
  // deterministic mock 2-3 ROs per contract
  const seed = contractId.length;
  const sites = ["NCR-041", "MH-117", "KA-052", "TN-018", "MH-203"];
  const statuses = ["Delivered", "Dispatched", "Processing"];
  const n = (seed % 2) + 2;
  return Array.from({ length: n }, (_, i) => ({
    id: `RO-${2026}-${(seed * 31 + i * 17) % 9000 + 1000}`,
    date: `${10 + i * 6} ${["Jan", "Feb", "Mar", "Apr"][i % 4]} 2026`,
    qty: 12 + i * 6,
    site: sites[(seed + i) % sites.length],
    status: statuses[i % statuses.length],
    eta: `${15 + i * 6} ${["Jan", "Feb", "Mar", "Apr"][i % 4]} 2026`,
  }));
}

export function MyContracts() {
  const mine = CONTRACTS.filter((c) => c.customer === "Indus Towers");
  const { setView, setSelectedContractId } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);
  const daysToExpiry = (end: string) => {
    const [d, m, y] = end.split(" ");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(m);
    return Math.round((new Date(Number(y), months, Number(d)).getTime() - Date.now()) / 86400000);
  };

  return (
    <div>
      <PageHeader title="My Contracts" sub="Active rate contracts with Amara Raja" />
      <AISuggestions
        items={[
          { text: "INDT-2024-002 will be exhausted 3 weeks before expiry — raise a new contract or emergency order.", action: "Place Order", onAction: () => { setSelectedContractId("INDT-2024-002"); setView("release-order"); } },
          { text: "INDT-2024-001 has 188 units balance with 14 months remaining — well-paced consumption.", action: "View Details", onAction: () => setExpanded("INDT-2024-001") },
          { text: "INDT-2025-009 utilisation is at 30%. Consider scheduling site rollouts.", action: "Plan Rollout" },
        ]}
      />
      <div className="grid md:grid-cols-2 gap-4">
        {mine.map((c) => {
          const days = daysToExpiry(c.end);
          const urgent = days < 60;
          const isOpen = expanded === c.id;
          const ros = sampleReleaseOrdersFor(c.id);
          return (
            <div key={c.id} className="card-base" style={{ borderTop: urgent ? "3px solid #EF9F27" : "3px solid #00A651" }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{c.id}</div>
                  <div style={{ fontSize: 13, color: "#4B5563" }}>{c.product} · {fmtINR(c.rate)}/unit</div>
                </div>
                <span className={urgent ? "badge-risk" : "badge-good"} style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11 }}>
                  {days} days to expiry
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div><div className="stat-label">Total</div><div style={{ fontSize: 18, fontWeight: 700 }}>{c.total}</div></div>
                <div><div className="stat-label">Consumed</div><div style={{ fontSize: 18, fontWeight: 700 }}>{c.consumed}</div></div>
                <div><div className="stat-label">Remaining</div><div style={{ fontSize: 18, fontWeight: 700 }}>{c.remaining}</div></div>
              </div>
              <div className="mt-3">
                <div className="h-2 rounded-full" style={{ background: "#E5E7EB" }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${(c.consumed / c.total) * 100}%`, background: urgent ? "#EF9F27" : "#00A651" }} />
                </div>
                <div className="flex justify-between mt-1.5" style={{ fontSize: 11, color: "#4B5563" }}>
                  <span>{c.start}</span><span>{c.end}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Btn variant="ghost" size="sm" onClick={() => setExpanded(isOpen ? null : c.id)}>
                  {isOpen ? <>Hide Orders <ChevronUp size={12} style={{ display: "inline", marginLeft: 4 }} /></> : <>View Orders <ChevronDown size={12} style={{ display: "inline", marginLeft: 4 }} /></>}
                </Btn>
                <Btn size="sm" onClick={() => { setSelectedContractId(c.id); setView("release-order"); }}>Place Release Order</Btn>
              </div>
              {isOpen && (
                <div className="mt-4 pt-3" style={{ borderTop: "1px solid #E5E7EB" }}>
                  <div className="stat-label mb-2">Release Orders</div>
                  <div className="overflow-x-auto rounded" style={{ border: "1px solid #E5E7EB" }}>
                    <table className="w-full" style={{ fontSize: 12 }}>
                      <thead style={{ background: "#F9FAFB" }}>
                        <tr style={{ color: "#4B5563", textTransform: "uppercase", textAlign: "left" }}>
                          <th className="py-2 px-3">Order ID</th><th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Qty</th><th className="py-2 px-3">Site</th>
                          <th className="py-2 px-3">Status</th><th className="py-2 px-3">ETA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ros.map((r) => (
                          <tr key={r.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                            <td className="py-2 px-3" style={{ fontWeight: 600 }}>{r.id}</td>
                            <td className="py-2 px-3">{r.date}</td>
                            <td className="py-2 px-3">{r.qty}</td>
                            <td className="py-2 px-3">{r.site}</td>
                            <td className="py-2 px-3"><StatusBadge status={r.status} /></td>
                            <td className="py-2 px-3">{r.eta}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =================== INDUSTRIAL CUSTOMER: PLACE RELEASE ORDER =================== */
export function PlaceReleaseOrder() {
  const mine = CONTRACTS.filter((c) => c.customer === "Indus Towers");
  const { setView, selectedContractId, setSelectedContractId, addReleaseOrder } = useApp();
  const initialId = selectedContractId && mine.find((c) => c.id === selectedContractId) ? selectedContractId : mine[0].id;
  const [contractId, setContractId] = useState(initialId);
  const [qty, setQty] = useState(10);
  const [site, setSite] = useState(SITES[0].id);
  const [date, setDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState<{ ro: string; eta: string; remaining: number } | null>(null);

  useEffect(() => {
    // Clear selectedContractId once consumed
    if (selectedContractId) setSelectedContractId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contract = mine.find((c) => c.id === contractId)!;
  const overage = qty > contract.remaining;
  const inputStyle = { border: "1px solid #D1D5DB", fontSize: 13, background: "#FFFFFF", padding: "8px 10px", borderRadius: 6 } as const;

  if (confirmed) {
    return (
      <div>
        <PageHeader title="Release Order Confirmed" sub="Your contract release order has been recorded" />
        <div className="card-base max-w-2xl mx-auto text-center py-8">
          <div className="inline-flex items-center justify-center" style={{ width: 64, height: 64, borderRadius: "50%", background: "#DCFCE7" }}>
            <CheckCircle2 size={36} color="#15803D" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 16 }}>Release Order {confirmed.ro} Confirmed</div>
          <div style={{ fontSize: 14, color: "#4B5563", marginTop: 8 }}>
            Expected Delivery: <strong style={{ color: "#0A0A0F" }}>{confirmed.eta}</strong>
          </div>
          <div style={{ fontSize: 13, color: "#4B5563", marginTop: 4 }}>
            Contract remaining balance: <strong style={{ color: "#0A0A0F" }}>{confirmed.remaining} units</strong>
          </div>
          <div className="mt-6">
            <Btn onClick={() => setView("contracts")}>Back to My Contracts</Btn>
          </div>
        </div>
      </div>
    );
  }

  const total = qty * contract.rate;
  const etaDate = new Date(new Date(date).getTime() + 3 * 86400000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div>
      <button onClick={() => setView("contracts")} className="flex items-center gap-1.5 mb-3" style={{ fontSize: 13, color: "#2B31B8", fontWeight: 600 }}>
        <ArrowLeft size={14} /> Back to My Contracts
      </button>
      <PageHeader title="Place Release Order" sub="Order against an active rate contract" />
      <AISuggestions
        items={[
          { text: "Contract INDT-2024-002 has only 20 units left — consider topping up from INDT-2025-009.", action: "Switch Contract", onAction: () => setContractId("INDT-2025-009") },
          { text: "Tower Site NCR-041 has 6 critical units — prioritize this delivery site.", action: "Set Site", onAction: () => setSite("NCR-041") },
        ]}
      />
      <div className="grid lg:grid-cols-3 gap-4">
        <form
          className="card-base lg:col-span-2 space-y-3"
          onSubmit={(e) => { e.preventDefault(); if (!overage) setConfirming(true); }}
        >
          <div>
            <label className="stat-label block mb-1">Contract</label>
            <select value={contractId} onChange={(e) => setContractId(e.target.value)} className="w-full" style={inputStyle}>
              {mine.map((c) => <option key={c.id} value={c.id}>{c.id} — {c.product}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label block mb-1">Product</label>
              <input value={contract.product} readOnly className="w-full" style={{ ...inputStyle, background: "#F3F4F6" }} />
            </div>
            <div>
              <label className="stat-label block mb-1">Agreed Rate</label>
              <input value={`${fmtINR(contract.rate)} / unit`} readOnly className="w-full" style={{ ...inputStyle, background: "#F3F4F6" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label block mb-1">Delivery Site</label>
              <select value={site} onChange={(e) => setSite(e.target.value)} className="w-full" style={inputStyle}>
                {SITES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="stat-label block mb-1">Requested Delivery Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full" style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="stat-label block mb-1">Quantity</label>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-full" style={inputStyle} />
            <div style={{ fontSize: 12, color: overage ? "#C00000" : "#4B5563", marginTop: 4, fontWeight: 600 }}>
              {overage
                ? `Quantity exceeds available contract balance of ${contract.remaining} units`
                : `Available: ${contract.remaining} units.`}
            </div>
          </div>
          <div>
            <label className="stat-label block mb-1">Special Instructions</label>
            <textarea rows={3} className="w-full" style={inputStyle} />
          </div>
          <Btn type="submit" disabled={overage}>Submit Release Order</Btn>
        </form>

        <div className="card-base h-fit" style={{ borderTop: "3px solid #5B5BF5" }}>
          <div className="stat-label mb-3">Order Summary</div>
          <div className="space-y-2.5" style={{ fontSize: 14 }}>
            <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Contract</span><span style={{ fontWeight: 600 }}>{contract.id}</span></div>
            <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Product</span><span style={{ fontWeight: 600 }}>{contract.product}</span></div>
            <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Rate</span><span>{fmtINR(contract.rate)}/unit</span></div>
            <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Quantity</span><span>{qty}</span></div>
            <div className="flex justify-between pt-3" style={{ borderTop: "1px solid #E5E7EB", fontSize: 16, fontWeight: 700 }}>
              <span>Order Total</span><span>{fmtINRLakh(total)}</span>
            </div>
            <div className="flex justify-between" style={{ color: "#4B5563", fontSize: 13 }}>
              <span>Balance after</span><span>{contract.remaining - qty} units</span>
            </div>
          </div>
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Confirm Release Order"
          confirmLabel="Confirm"
          body={
            <div className="space-y-1.5" style={{ fontSize: 13 }}>
              <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Contract ID</span><span style={{ fontWeight: 600 }}>{contract.id}</span></div>
              <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Product</span><span style={{ fontWeight: 600 }}>{contract.product}</span></div>
              <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Quantity</span><span style={{ fontWeight: 600 }}>{qty} units</span></div>
              <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Delivery Site</span><span style={{ fontWeight: 600 }}>{SITES.find((s) => s.id === site)?.name}</span></div>
              <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Requested Date</span><span style={{ fontWeight: 600 }}>{date}</span></div>
              <div className="flex justify-between pt-2 mt-1" style={{ borderTop: "1px solid #E5E7EB", fontWeight: 700 }}>
                <span>Total Value</span><span>{fmtINRLakh(total)}</span>
              </div>
            </div>
          }
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            const ro = "RO-" + Math.floor(1000 + Math.random() * 9000);
            addReleaseOrder({ id: ro, contractId: contract.id, qty, site, date, eta: etaDate, total });
            setConfirming(false);
            setConfirmed({ ro, eta: etaDate, remaining: contract.remaining - qty });
          }}
        />
      )}
    </div>
  );
}

/* =================== IAM/ADMIN: ALL CONTRACTS =================== */

function ContractDetailDrawer({ contractId, onClose }: { contractId: string; onClose: () => void }) {
  const c = CONTRACTS.find((x) => x.id === contractId)!;
  const [d, m, y] = c.end.split(" ");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(m);
  const days = Math.round((new Date(Number(y), months, Number(d)).getTime() - Date.now()) / 86400000);
  const utilisation = Math.round((c.consumed / c.total) * 100);
  const ros = sampleReleaseOrdersFor(c.id);
  const dayColor = days < 30 ? "#C00000" : days < 60 ? "#EF9F27" : "#15803D";

  return (
    <RightDrawer title="Contract Details" sub={c.id} onClose={onClose}>
      <div className="space-y-1.5 mb-4" style={{ fontSize: 13 }}>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Contract ID</span><span style={{ fontWeight: 700 }}>{c.id}</span></div>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Customer</span><span style={{ fontWeight: 600 }}>{c.customer}</span></div>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Product</span><span style={{ fontWeight: 600 }}>{c.product}</span></div>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Agreed Rate</span><span>{fmtINR(c.rate)} / unit</span></div>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Total Quantity</span><span>{c.total} units</span></div>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Consumed</span><span>{c.consumed} units</span></div>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Remaining</span><span style={{ fontWeight: 700 }}>{c.remaining} units</span></div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between mb-1.5" style={{ fontSize: 11, color: "#4B5563", fontWeight: 600 }}>
          <span>UTILISATION</span><span>{utilisation}%</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: "#E5E7EB" }}>
          <div className="h-full rounded-full" style={{ width: `${utilisation}%`, background: utilisation > 80 ? "#EF9F27" : "#00A651" }} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4" style={{ fontSize: 12 }}>
        <div className="p-2 rounded" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
          <div className="stat-label">Start</div><div style={{ fontWeight: 600 }}>{c.start}</div>
        </div>
        <div className="p-2 rounded" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
          <div className="stat-label">End</div><div style={{ fontWeight: 600 }}>{c.end}</div>
        </div>
        <div className="p-2 rounded" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
          <div className="stat-label">Days to Expiry</div><div style={{ fontWeight: 700, color: dayColor }}>{days}d</div>
        </div>
      </div>
      {days < 60 && (
        <div className="rounded p-3 mb-4" style={{ background: "#EEF0FF", border: "1px solid #C7CCF7", fontSize: 12, color: "#2B31B8" }}>
          Cogniq: Contract expires in {days} days at current consumption pace. Consider initiating renewal.
        </div>
      )}
      <div className="stat-label mb-2">Release Orders Under This Contract</div>
      <div className="overflow-x-auto rounded" style={{ border: "1px solid #E5E7EB" }}>
        <table className="w-full" style={{ fontSize: 12 }}>
          <thead style={{ background: "#F9FAFB" }}>
            <tr style={{ color: "#4B5563", textTransform: "uppercase", textAlign: "left" }}>
              <th className="py-2 px-3">Order ID</th><th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Qty</th><th className="py-2 px-3">Site</th>
              <th className="py-2 px-3">Status</th><th className="py-2 px-3">ETA</th>
            </tr>
          </thead>
          <tbody>
            {ros.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                <td className="py-2 px-3" style={{ fontWeight: 600 }}>{r.id}</td>
                <td className="py-2 px-3">{r.date}</td>
                <td className="py-2 px-3">{r.qty}</td>
                <td className="py-2 px-3">{r.site}</td>
                <td className="py-2 px-3"><StatusBadge status={r.status} /></td>
                <td className="py-2 px-3">{r.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5">
        <Btn variant="ghost" size="sm" onClick={onClose}>Close</Btn>
      </div>
    </RightDrawer>
  );
}

export function AllContracts() {
  const [search, setSearch] = useState("");
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const { selectedCustomer, setSelectedCustomer } = useApp();
  const [customer, setCustomer] = useState("All");
  const customers = useMemo(() => Array.from(new Set(CONTRACTS.map((c) => c.customer))), []);

  const effectiveCustomer = selectedCustomer ?? (customer === "All" ? null : customer);

  const daysToExpiry = (end: string) => {
    const [d, m, y] = end.split(" ");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(m);
    return Math.round((new Date(Number(y), months, Number(d)).getTime() - Date.now()) / 86400000);
  };

  const filtered = CONTRACTS.filter((c) =>
    (effectiveCustomer === null || c.customer === effectiveCustomer) &&
    (search === "" || c.id.toLowerCase().includes(search.toLowerCase()) || c.product.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <PageHeader title="Contracts" sub="All active rate contracts across customers" />
      <AISuggestions
        items={[
          { text: "INDT-2024-002 expires in 46 days with consumption rate ahead of schedule. Renewal recommended.", action: "Draft Renewal" },
          { text: "Total contract value at risk in next 90 days: ₹2.34 Cr across 3 contracts.", action: "View at-risk" },
          { text: "BSNL contracts are 51% utilised — schedule mid-term review meeting.", action: "Schedule" },
        ]}
      />
      {selectedCustomer && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ background: "#EEF0FF", border: "1px solid #C7CCF7", fontSize: 12, fontWeight: 600, color: "#2B31B8" }}>
          Filtered by: {selectedCustomer}
          <button onClick={() => setSelectedCustomer(null)} aria-label="Clear filter"><X size={14} /></button>
        </div>
      )}
      <FilterBar
        search={search} onSearch={setSearch}
        category={selectedCustomer ?? customer} onCategory={(v) => { setSelectedCustomer(null); setCustomer(v); }}
        categories={customers}
      />
      <div className="card-base p-0 overflow-x-auto">
        <table className="w-full" style={{ fontSize: 13 }}>
          <thead>
            <tr style={{ color: "#4B5563", fontSize: 11, textTransform: "uppercase", textAlign: "left" }}>
              <th className="py-3 px-4">Customer</th><th className="py-3 px-4">Contract</th>
              <th className="py-3 px-4">Product</th><th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Consumed</th><th className="py-3 px-4">Remaining</th>
              <th className="py-3 px-4">Expiry</th><th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const days = daysToExpiry(c.end);
              const color = days < 30 ? "#C00000" : days < 60 ? "#EF9F27" : "#15803D";
              return (
                <tr key={c.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                  <td className="py-3 px-4" style={{ fontWeight: 600 }}>{c.customer}</td>
                  <td className="py-3 px-4">{c.id}</td>
                  <td className="py-3 px-4">{c.product}</td>
                  <td className="py-3 px-4">{c.total}</td>
                  <td className="py-3 px-4">{c.consumed}</td>
                  <td className="py-3 px-4" style={{ fontWeight: 600 }}>{c.remaining}</td>
                  <td className="py-3 px-4" style={{ color, fontWeight: 600 }}>{c.end} ({days}d)</td>
                  <td className="py-3 px-4"><Btn variant="ghost" size="sm" onClick={() => setDrawerId(c.id)}>View Details</Btn></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {drawerId && <ContractDetailDrawer contractId={drawerId} onClose={() => setDrawerId(null)} />}
    </div>
  );
}
