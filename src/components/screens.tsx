import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  PRODUCTS, DEALER_ORDERS, REGIONAL_ORDERS, SKU_SELLTHROUGH, REGIONS,
  STOCKOUT_ALERTS, SITES, SITE_UNITS, ALL_FLEET_SITES, CONTRACTS,
  fmtINR, fmtINRLakh,
} from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { StatCard, StatusBadge, PageHeader, AISuggestions, CogniqBanner, Btn, FilterBar, Pagination } from "./ui-bits";
import { Search, ShoppingCart, X, Plus, Minus, ArrowRight, Trash2 } from "lucide-react";

const PAGE_SIZE = 8;

/* =================== DEALER: HOME =================== */
export function DealerHome() {
  const { setView } = useApp();
  return (
    <div>
      <PageHeader title="Welcome back, Sharma Auto Parts" sub="Quick view of your store activity" />
      <AISuggestions
        items={[
          { text: "Amaron Pro 35Ah may run out in 9 days based on your sales pattern. Reorder 40 units now to avoid stock-out.", action: "Reorder", onAction: () => setView("catalog") },
          { text: "‘Summer Boost’ scheme is active — earn 2% extra credit on orders above ₹2 L till 31 May.", action: "View Catalog", onAction: () => setView("catalog") },
          { text: "Your 9-day order gap exceeds your 7-day average. Place a quick reorder to maintain shelf health.", action: "Quick Reorder", onAction: () => setView("catalog") },
          { text: "Powerzone Hummer 65Ah trending +18% in your region — consider stocking 12 units.", action: "Add to Cart", onAction: () => setView("catalog") },
        ]}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard label="Open Orders" value="2" change="ETA 19–20 May" accent="crimson" />
        <StatCard label="Sales This Week" value="₹1.84 L" change="+12% vs last week" accent="green" />
        <StatCard label="SKUs in Low Stock" value="3" change="Reorder recommended" accent="amber" />
        <StatCard label="Days Since Last Order" value="9" change="Avg cycle: 7 days" accent="amber" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-base">
          <div className="stat-label mb-3">Quick actions</div>
          <div className="flex flex-col gap-2">
            <button onClick={() => setView("catalog")} className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-[#F3F4F6]" style={{ border: "1px solid #E5E7EB", fontSize: 14 }}>
              Browse Product Catalog <ArrowRight size={16} />
            </button>
            <button onClick={() => setView("orders")} className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-[#F3F4F6]" style={{ border: "1px solid #E5E7EB", fontSize: 14 }}>
              Track My Orders <ArrowRight size={16} />
            </button>
            <button onClick={() => setView("pos")} className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-[#F3F4F6]" style={{ border: "1px solid #E5E7EB", fontSize: 14 }}>
              Log Today's Sales (POS) <ArrowRight size={16} />
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
    </div>
  );
}

/* =================== DEALER: CATALOG =================== */
export function ProductCatalog() {
  const [filter, setFilter] = useState<"All" | "2W" | "4W" | "Industrial">("All");
  const [search, setSearch] = useState("");
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const { cart, addToCart, setView } = useApp();

  const filtered = PRODUCTS.filter((p) =>
    (filter === "All" || p.type === filter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const setQty = (id: string, q: number) => setQtyMap({ ...qtyMap, [id]: Math.max(1, q) });
  const getQty = (id: string) => qtyMap[id] ?? 1;
  const totalCartItems = cart.reduce((s, c) => s + c.qty, 0);

  const handleAdd = (id: string) => {
    const p = PRODUCTS.find((x) => x.id === id)!;
    const q = getQty(id);
    addToCart({ id, name: p.name, price: p.price, qty: q });
    toast.success(`${p.name} ×${q} added to cart`);
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
            <div
              className="rounded-md overflow-hidden mb-3"
              style={{ height: 160, background: "#F3F4F6" }}
            >
              <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</div>
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
                <button onClick={() => setQty(p.id, getQty(p.id) - 1)} style={{ padding: "6px 8px" }} aria-label="Decrease">
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  value={getQty(p.id)}
                  onChange={(e) => setQty(p.id, Number(e.target.value) || 1)}
                  className="text-center"
                  style={{ width: 44, fontSize: 13, padding: "5px 0", border: "none", outline: "none" }}
                />
                <button onClick={() => setQty(p.id, getQty(p.id) + 1)} style={{ padding: "6px 8px" }} aria-label="Increase">
                  <Plus size={14} />
                </button>
              </div>
              <Btn onClick={() => handleAdd(p.id)} size="sm">Add to Cart</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =================== DEALER: CART (full page) =================== */
export function CartPage() {
  const { cart, setCart, setView } = useApp();
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const gst = Math.round(subtotal * 0.18);
  const delivery = subtotal > 200000 ? 0 : 500;
  const total = subtotal + gst + delivery;

  const updateQty = (id: string, q: number) => {
    if (q <= 0) setCart(cart.filter((c) => c.id !== id));
    else setCart(cart.map((c) => c.id === id ? { ...c, qty: q } : c));
  };

  if (cart.length === 0) {
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
      <PageHeader title="Your Cart" sub={`${cart.length} item${cart.length === 1 ? "" : "s"} · Review and proceed to checkout`} />
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card-base p-0">
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

        <div className="card-base h-fit" style={{ borderTop: "3px solid #5B5BF5" }}>
          <div className="stat-label mb-3">Order Summary</div>
          <div className="space-y-2.5" style={{ fontSize: 14 }}>
            <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Subtotal</span><span>{fmtINR(subtotal)}</span></div>
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
            onClick={() => { toast.success(`Order placed — ${fmtINR(total)} · ETA 3-5 days`); setCart([]); setView("orders"); }}
            className="w-full mt-4 py-3 rounded-md text-white"
            style={{ background: "#C00000", fontSize: 14, fontWeight: 700 }}
          >
            Proceed to Checkout
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
    </div>
  );
}

/* =================== DEALER: ORDERS =================== */
export function MyOrders() {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("30d");
  const [page, setPage] = useState(1);
  const { openAction } = useApp();
  const filtered = DEALER_ORDERS.filter((o) =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.items.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader title="My Orders" sub="Track every order placed with Amara Raja" />
      <AISuggestions
        items={[
          { text: "ORD-7860 (Amaron Hi-Life ×24) is processing — projected to dispatch by 18 May.", action: "Track" },
          { text: "Based on your sales pattern, Amaron Pro 35Ah may run out in 9 days. Reorder now?", action: "Reorder" },
          { text: "Your average order cycle is 7 days. Consider scheduling weekly auto-reorders for top SKUs.", action: "Set up Auto-reorder" },
        ]}
      />
      <FilterBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} dateRange={dateRange} onDateRange={setDateRange} />
      <div className="card-base p-0 overflow-x-auto">
        <table className="w-full" style={{ fontSize: 13 }}>
          <thead>
            <tr style={{ color: "#4B5563", fontSize: 11, textTransform: "uppercase", textAlign: "left" }}>
              <th className="py-3 px-4">Order ID</th><th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Items</th><th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Status</th><th className="py-3 px-4">ETA</th><th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((o) => (
              <tr key={o.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                <td className="py-3 px-4" style={{ fontWeight: 600 }}>{o.id}</td>
                <td className="py-3 px-4" style={{ color: "#4B5563" }}>{o.date}</td>
                <td className="py-3 px-4">{o.items}</td>
                <td className="py-3 px-4" style={{ fontWeight: 600 }}>{fmtINR(o.total)}</td>
                <td className="py-3 px-4"><StatusBadge status={o.status} /></td>
                <td className="py-3 px-4" style={{ color: "#4B5563" }}>{o.eta}</td>
                <td className="py-3 px-4"><Btn variant="ghost" size="sm" onClick={() => openAction({
                  title: `Track Order ${o.id}`,
                  description: `Live status for your order.`,
                  summary: [
                    { label: "Order ID", value: o.id },
                    { label: "Items", value: o.items },
                    { label: "Total", value: fmtINR(o.total) },
                    { label: "Status", value: o.status },
                    { label: "ETA", value: o.eta },
                    { label: "Carrier", value: "Amara Logistics · AWB-" + o.id.slice(-4) + "21" },
                  ],
                  fields: [
                    { type: "select", name: "support", label: "Need help?", options: ["No issue — just tracking", "Delivery delay", "Wrong items expected", "Reschedule delivery"] },
                    { type: "textarea", name: "notes", label: "Message to dispatch (optional)" },
                  ],
                  confirmLabel: "Notify Dispatch",
                  successTitle: "Dispatch notified",
                  successDescription: "Our logistics team will respond within 2 working hours.",
                })}>Track</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}

/* =================== DEALER: POS (multi-line) =================== */
type PosLine = { sku: string; qty: number; vehicle: string };
type PosBatch = { id: string; date: string; customer: string; phone: string; lines: PosLine[]; notes: string };

export function POSEntry() {
  const today = new Date().toISOString().slice(0, 10);
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

  const inputStyle = { border: "1px solid #D1D5DB", fontSize: 13, background: "#FFFFFF", padding: "8px 10px", borderRadius: 6 } as const;

  return (
    <div>
      <PageHeader title="POS Entry" sub="Log today's secondary sales for Cogniq forecasting" />
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
          <div className="px-4 pt-4 stat-label">Today's batches ({batches.length})</div>
          <table className="w-full mt-3" style={{ fontSize: 13 }}>
            <thead>
              <tr style={{ color: "#4B5563", fontSize: 11, textTransform: "uppercase", textAlign: "left" }}>
                <th className="py-2 px-4">Batch</th><th className="py-2 px-4">Customer</th>
                <th className="py-2 px-4">Items</th><th className="py-2 px-4">Total Qty</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                  <td className="py-2.5 px-4" style={{ fontWeight: 600 }}>{b.id}</td>
                  <td className="py-2.5 px-4">{b.customer}{b.phone && <div style={{ fontSize: 11, color: "#6B7280" }}>{b.phone}</div>}</td>
                  <td className="py-2.5 px-4" style={{ fontSize: 12 }}>
                    {b.lines.map((l, i) => (
                      <div key={i}>{l.sku} ×{l.qty} <span style={{ color: "#6B7280" }}>({l.vehicle})</span></div>
                    ))}
                  </td>
                  <td className="py-2.5 px-4" style={{ fontWeight: 600 }}>{b.lines.reduce((s, l) => s + l.qty, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =================== ADMIN/RSM: DEALER ORDERS =================== */
export function DealerOrdersAdmin() {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("30d");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);

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
              fontSize: 12,
              fontWeight: 600,
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
                <td className="py-3 px-4">
                  <Btn variant="ghost" size="sm" onClick={() => toast.message(`${o.id}`, { description: `${o.dealer} · ${o.skus} · ${fmtINR(o.value)}` })}>View</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}

/* =================== ADMIN/RSM: SECONDARY SALES =================== */
export function SecondarySales() {
  const max = Math.max(...SKU_SELLTHROUGH.map((s) => s.units));
  return (
    <div>
      <PageHeader title="Secondary Sales Intelligence" sub="POS data, sell-through and predictive stock-out alerts" />
      <AISuggestions
        items={[
          { text: "Amaron Pro 35Ah trending 23% above forecast in NCR. Consider increasing allocation.", action: "Reallocate" },
          { text: "14 dealers in Maharashtra have not logged POS data in 7 days. Follow-up recommended.", action: "Send Reminder" },
          { text: "Powerzone 45Ah stock-out predicted in Tamil Nadu within 12 days at current sell rate.", action: "Alert Dealers" },
          { text: "AmaronVolt 200Ah pickup is +18% in industrial segment — coordinate with IAM team.", action: "Notify IAM" },
        ]}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard label="POS Entries This Week" value="1,284" change="+11% vs last week" accent="green" />
        <StatCard label="Top Selling SKU" value="Amaron Hi-Life" change="2,120 units" accent="crimson" />
        <StatCard label="Dormant Dealers (14d)" value="14" change="Follow-up needed" accent="amber" />
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

      <div className="card-base p-0 overflow-x-auto">
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
                <td className="py-3 px-4"><Btn size="sm" onClick={() => toast.success(`Alert sent to ${a.dealer}`)}>Alert Dealer</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
        <StatCard label="Dealer Orders (MTD)" value="₹14.82 Cr" change="+8% vs last month" accent="crimson" />
        <StatCard label="Industrial Revenue (MTD)" value="₹6.41 Cr" change="+12% vs last month" accent="green" />
        <StatCard label="Critical Sites" value="8" change="Across 3 customers" accent="amber" />
        <StatCard label="Replacement Pipeline (60d)" value="₹12.4 L" change="14 units · 6 sites" accent="amber" />
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
export function RSMDashboard() {
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
        <StatCard label="Active Dealers" value="42" change="3 new this month" accent="crimson" />
        <StatCard label="Region Sales (MTD)" value="₹4.82 Cr" change="+14% vs last month" accent="green" />
        <StatCard label="Dormant Dealers" value="6" change="No order > 7 days" accent="amber" />
        <StatCard label="Stock-out Alerts" value="2" change="Within 12 days" accent="amber" />
      </div>
      <SecondarySales />
    </div>
  );
}

/* =================== INDUSTRIAL CUSTOMER: MY SITES =================== */
export function MySites() {
  const [openSite, setOpenSite] = useState<string | null>(null);
  const [srOpen, setSrOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const totalUnits = SITES.reduce((s, x) => s + x.units, 0);
  const atRisk = SITES.filter((s) => s.status === "At Risk").reduce((s, x) => s + x.units, 0);
  const critical = SITES.filter((s) => s.status === "Critical").reduce((s, x) => s + x.units, 0);

  const filtered = SITES.filter((s) => statusFilter === "All" || s.status === statusFilter);

  return (
    <div>
      <PageHeader title="My Fleet Overview" sub="Indus Towers — battery health across all sites" />
      <AISuggestions
        items={[
          { text: "Tower Site NCR-041 has 6 critical units (88% avg life used). Inspection recommended within 14 days.", action: "Raise SR", onAction: () => setSrOpen(true) },
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
              <Btn variant="ghost" size="sm" onClick={() => setOpenSite(s.id)}>View Details</Btn>
              <Btn variant="crimson" size="sm" onClick={() => setSrOpen(true)}>Raise Service Request</Btn>
            </div>
          </div>
        ))}
      </div>

      {openSite && SITE_UNITS[openSite] && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setOpenSite(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white w-full sm:max-w-3xl rounded-t-xl sm:rounded-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} style={{ border: "1px solid #E5E7EB" }}>
            <div className="flex justify-between items-center px-5 py-4" style={{ borderBottom: "1px solid #E5E7EB" }}>
              <div>
                <h2 style={{ fontSize: 18 }}>{SITES.find((s) => s.id === openSite)?.name}</h2>
                <div style={{ fontSize: 12, color: "#4B5563" }}>Battery unit detail</div>
              </div>
              <button onClick={() => setOpenSite(null)}><X size={18} /></button>
            </div>
            <div className="p-5 overflow-x-auto">
              <table className="w-full" style={{ fontSize: 13 }}>
                <thead>
                  <tr style={{ color: "#4B5563", fontSize: 11, textTransform: "uppercase", textAlign: "left" }}>
                    <th className="py-2 pr-3">Unit ID</th><th className="py-2 pr-3">Model</th>
                    <th className="py-2 pr-3">Installed</th><th className="py-2 pr-3">Age</th>
                    <th className="py-2 pr-3">Life Used</th><th className="py-2 pr-3">Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {SITE_UNITS[openSite].map((u) => (
                    <tr key={u.unitId} style={{ borderTop: "1px solid #E5E7EB" }}>
                      <td className="py-2.5 pr-3" style={{ fontWeight: 600 }}>{u.unitId}</td>
                      <td className="py-2.5 pr-3">{u.model}</td>
                      <td className="py-2.5 pr-3" style={{ color: "#4B5563" }}>{u.installed}</td>
                      <td className="py-2.5 pr-3">{u.ageMonths} mo</td>
                      <td className="py-2.5 pr-3" style={{ minWidth: 140 }}>
                        <div className="h-2 rounded-full" style={{ background: "#E5E7EB" }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${u.lifeUsed}%`, background: u.lifeUsed > 80 ? "#C00000" : u.lifeUsed > 60 ? "#EF9F27" : "#00A651" }} />
                        </div>
                        <div style={{ fontSize: 11, color: "#4B5563", marginTop: 2 }}>{u.lifeUsed}%</div>
                      </td>
                      <td className="py-2.5 pr-3"><StatusBadge status={u.status} /></td>
                      <td className="py-2.5"><Btn size="sm" onClick={() => setSrOpen(true)}>Raise SR</Btn></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {srOpen && <ServiceRequestModal onClose={() => setSrOpen(false)} />}
    </div>
  );
}

function ServiceRequestModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white w-full max-w-md rounded-xl p-5" onClick={(e) => e.stopPropagation()} style={{ border: "1px solid #E5E7EB" }}>
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ fontSize: 18 }}>Raise Service Request</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Service request submitted — SR-2026-0143");
            onClose();
          }}
        >
          <div>
            <label className="stat-label block mb-1">Site</label>
            <select className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "1px solid #D1D5DB", fontSize: 13, background: "#FFFFFF" }}>
              {SITES.map((s) => <option key={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="stat-label block mb-1">Unit ID</label>
            <select className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "1px solid #D1D5DB", fontSize: 13, background: "#FFFFFF" }}>
              <option>U-NCR041-01</option><option>U-NCR041-02</option><option>U-MH117-01</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label block mb-1">Request Type</label>
              <select className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "1px solid #D1D5DB", fontSize: 13, background: "#FFFFFF" }}>
                <option>Inspection</option><option>Replacement</option><option>Emergency</option>
              </select>
            </div>
            <div>
              <label className="stat-label block mb-1">Priority</label>
              <select className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "1px solid #D1D5DB", fontSize: 13, background: "#FFFFFF" }}>
                <option>Normal</option><option>High</option><option>Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="stat-label block mb-1">Description</label>
            <textarea rows={3} className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "1px solid #D1D5DB", fontSize: 13 }} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="ghost" size="sm" onClick={onClose}>Cancel</Btn>
            <Btn type="submit">Submit</Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =================== IAM: FLEET HEALTH =================== */
export function IAMFleetHealth() {
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("All");
  const [page, setPage] = useState(1);

  const customers = useMemo(() => Array.from(new Set(ALL_FLEET_SITES.map((s) => s.customer))), []);
  const filtered = ALL_FLEET_SITES.filter((s) =>
    (customer === "All" || s.customer === customer) &&
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
          { text: "14 units across 6 sites are predicted to require replacement within 60 days. Estimated value: ₹12.4 L.", action: "View Pipeline" },
          { text: "Indus Towers NCR-041 and BSNL BSNL-KA-09 are Critical — combined 16 units due in 30 days.", action: "Schedule Visit" },
          { text: "47 units forecast for 90-day replacement (₹38.6 L) — align with procurement cycle.", action: "Sync Procurement" },
        ]}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Sites Managed" value={String(total)} change="3 customers" accent="green" />
        <StatCard label="Critical Sites" value={String(critical)} change="Action required" accent="crimson" />
        <StatCard label="At Risk Sites" value={String(risk)} change="Inspect within 30 days" accent="amber" />
        <StatCard label="Replacement Pipeline" value="₹12.4 L" change="60-day forecast" accent="amber" />
      </div>
      <FilterBar
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }}
        category={customer} onCategory={(v) => { setCustomer(v); setPage(1); }}
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
                <td className="py-3 px-4"><Btn variant="ghost" size="sm" onClick={() => toast.message(`${s.site}`, { description: `${s.customer} · ${s.units} units · ${s.status}` })}>View</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}

/* =================== IAM: CUSTOMERS DASHBOARD =================== */
export function IAMCustomers() {
  const { setView } = useApp();
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
              <div>
                <div className="stat-label">Sites</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{x.sites}</div>
              </div>
              <div>
                <div className="stat-label">Units</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{x.units}</div>
              </div>
              <div>
                <div className="stat-label">Contracts</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{x.contracts}</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Btn variant="ghost" size="sm" onClick={() => { setView("fleet-health"); }}>View Sites</Btn>
              <Btn size="sm" onClick={() => { setView("contracts"); }}>Contracts</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =================== INDUSTRIAL CUSTOMER: MY CONTRACTS =================== */
export function MyContracts() {
  const mine = CONTRACTS.filter((c) => c.customer === "Indus Towers");
  const { setView } = useApp();
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
          { text: "INDT-2024-002 will be exhausted 3 weeks before expiry — raise a new contract or emergency order.", action: "Place Order", onAction: () => setView("release-order") },
          { text: "INDT-2024-001 has 188 units balance with 14 months remaining — well-paced consumption.", action: "View Details" },
          { text: "INDT-2025-009 utilisation is at 30%. Consider scheduling site rollouts.", action: "Plan Rollout" },
        ]}
      />
      <div className="grid md:grid-cols-2 gap-4">
        {mine.map((c) => {
          const days = daysToExpiry(c.end);
          const urgent = days < 60;
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
                <Btn variant="ghost" size="sm" onClick={() => toast.message(`${c.id} order history`, { description: `${c.consumed} units consumed across multiple sites` })}>View Orders</Btn>
                <Btn size="sm" onClick={() => setView("release-order")}>Place Release Order</Btn>
              </div>
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
  const [contractId, setContractId] = useState(mine[0].id);
  const [qty, setQty] = useState(10);
  const [site, setSite] = useState(SITES[0].id);
  const [date, setDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const contract = mine.find((c) => c.id === contractId)!;
  const overage = qty > contract.remaining;
  const inputStyle = { border: "1px solid #D1D5DB", fontSize: 13, background: "#FFFFFF", padding: "8px 10px", borderRadius: 6 } as const;

  return (
    <div>
      <PageHeader title="Place Release Order" sub="Order against an active rate contract" />
      <AISuggestions
        items={[
          { text: "Contract INDT-2024-002 has only 20 units left — consider topping up from INDT-2025-009.", action: "Switch Contract" },
          { text: "Tower Site NCR-041 has 6 critical units — prioritize this delivery site.", action: "Set Site" },
        ]}
      />
      <div className="grid lg:grid-cols-3 gap-4">
        <form
          className="card-base lg:col-span-2 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!overage) toast.success(`Release order placed — ${qty} × ${contract.product}`);
          }}
        >
          <div>
            <label className="stat-label block mb-1">Contract</label>
            <select value={contractId} onChange={(e) => setContractId(e.target.value)} className="w-full" style={inputStyle}>
              {mine.map((c) => <option key={c.id} value={c.id}>{c.id} — {c.product}</option>)}
            </select>
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
            <label className="stat-label block mb-1">Product</label>
            <input value={contract.product} disabled className="w-full" style={{ ...inputStyle, background: "#F3F4F6" }} />
          </div>
          <div>
            <label className="stat-label block mb-1">Quantity</label>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-full" style={inputStyle} />
            {overage && (
              <div style={{ fontSize: 12, color: "#C00000", marginTop: 4, fontWeight: 600 }}>
                Quantity exceeds contract balance ({contract.remaining} units remaining).
              </div>
            )}
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
              <span>Order Total</span><span>{fmtINRLakh(qty * contract.rate)}</span>
            </div>
            <div className="flex justify-between" style={{ color: "#4B5563", fontSize: 13 }}><span>Balance after</span><span>{contract.remaining - qty} units</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =================== IAM/ADMIN: ALL CONTRACTS =================== */
export function AllContracts() {
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("All");
  const customers = useMemo(() => Array.from(new Set(CONTRACTS.map((c) => c.customer))), []);

  const daysToExpiry = (end: string) => {
    const [d, m, y] = end.split(" ");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(m);
    return Math.round((new Date(Number(y), months, Number(d)).getTime() - Date.now()) / 86400000);
  };

  const filtered = CONTRACTS.filter((c) =>
    (customer === "All" || c.customer === customer) &&
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
      <FilterBar
        search={search} onSearch={setSearch}
        category={customer} onCategory={setCustomer}
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
                  <td className="py-3 px-4"><Btn variant="ghost" size="sm" onClick={() => toast.message(`${c.id}`, { description: `${c.customer} · ${c.product} · ${c.remaining} units left` })}>Manage</Btn></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
