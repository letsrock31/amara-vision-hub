import { useState } from "react";
import {
  PRODUCTS, DEALER_ORDERS, REGIONAL_ORDERS, SKU_SELLTHROUGH, REGIONS,
  STOCKOUT_ALERTS, SITES, SITE_UNITS, ALL_FLEET_SITES, CONTRACTS,
  fmtINR, fmtINRLakh,
} from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { StatCard, StatusBadge, PageHeader, CogniqPanel, CogniqBanner, Btn } from "./ui-bits";
import { Battery, Search, ShoppingCart, X, Plus, ArrowRight } from "lucide-react";

/* =================== DEALER: HOME =================== */
export function DealerHome() {
  const { setView } = useApp();
  return (
    <div>
      <PageHeader title="Welcome back, Sharma Auto Parts" sub="Quick view of your store activity" />
      <CogniqBanner
        text="Based on your sales pattern, Amaron Pro 35Ah may run out in 9 days. Reorder now?"
        action="Reorder"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label="Open Orders" value="2" change="ETA 19–20 May" accent="crimson" />
        <StatCard label="Sales This Week" value="₹1.84 L" change="+12% vs last week" accent="green" />
        <StatCard label="SKUs in Low Stock" value="3" change="Reorder recommended" accent="amber" />
        <StatCard label="Days Since Last Order" value="9" change="Avg cycle: 7 days" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-base">
          <div className="stat-label mb-3">Quick actions</div>
          <div className="flex flex-col gap-2">
            <button onClick={() => setView("catalog")} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#222222]" style={{ border: "0.5px solid #2E2E2E", fontSize: 13 }}>
              Browse Product Catalog <ArrowRight size={14} />
            </button>
            <button onClick={() => setView("orders")} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#222222]" style={{ border: "0.5px solid #2E2E2E", fontSize: 13 }}>
              Track My Orders <ArrowRight size={14} />
            </button>
            <button onClick={() => setView("pos")} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#222222]" style={{ border: "0.5px solid #2E2E2E", fontSize: 13 }}>
              Log Today's Sales (POS) <ArrowRight size={14} />
            </button>
          </div>
        </div>
        <div className="card-base">
          <div className="stat-label mb-3">Top SKUs this month</div>
          <div className="space-y-2.5">
            {SKU_SELLTHROUGH.slice(0, 4).map((s) => (
              <div key={s.sku}>
                <div className="flex justify-between" style={{ fontSize: 12 }}>
                  <span>{s.sku}</span><span style={{ color: "#9ca3af" }}>{s.units} units</span>
                </div>
                <div className="h-1.5 rounded-full mt-1" style={{ background: "#2A2A2A" }}>
                  <div className="h-full rounded-full" style={{ width: `${(s.units / 2200) * 100}%`, background: "#c00000" }} />
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
  const { cart, setCart } = useApp();
  const [cartOpen, setCartOpen] = useState(false);

  const filtered = PRODUCTS.filter((p) =>
    (filter === "All" || p.type === filter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const cartItems = cart.map((c) => ({ p: PRODUCTS.find((x) => x.id === c.id)!, q: c.qty }));
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);

  const updateQty = (id: string, delta: number) => {
    const next = cart
      .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
      .filter((c) => c.qty > 0);
    setCart(next);
  };

  const add = (id: string) => {
    const p = PRODUCTS.find((x) => x.id === id)!;
    const exists = cart.find((c) => c.id === id);
    if (exists) updateQty(id, 1);
    else setCart([...cart, { id, name: p.name, price: p.price, qty: 1 }]);
    setCartOpen(true);
  };

  return (
    <div>
      <PageHeader title="Product Catalog" sub="Browse and order from the full Amara Raja range" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} style={{ position: "absolute", left: 10, top: 9, color: "#9ca3af" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-8 pr-3 py-2 rounded-md outline-none"
            style={{ border: "0.5px solid #2E2E2E", fontSize: 13, background: "#1A1A1A" }}
          />
        </div>
        <div className="flex gap-1.5">
          {(["All", "2W", "4W", "Industrial"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-full"
              style={{
                fontSize: 11,
                background: filter === f ? "#C00000" : "#1A1A1A",
                color: "#FFFFFF",
                border: "0.5px solid #2E2E2E",
              }}
            >
              {f}
            </button>
          ))}
          <button
            onClick={() => setCartOpen(true)}
            className="px-3 py-1.5 rounded-full flex items-center gap-1"
            style={{ fontSize: 11, background: "#1A1A1A", border: "0.5px solid #2E2E2E" }}
          >
            <ShoppingCart size={12} /> Cart ({cartItems.reduce((s, i) => s + i.q, 0)})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="card-base flex flex-col">
            <div
              className="rounded-md flex items-center justify-center mb-3"
              style={{ height: 110, background: p.brand === "Amaron" ? "#2E0D0D" : p.brand === "Powerzone" ? "#2A2A2A" : "#0A2212" }}
            >
              <Battery size={36} color={p.brand === "Amaron" ? "#c00000" : p.brand === "Powerzone" ? "#9ca3af" : "#22a850"} />
            </div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div style={{ fontSize: 13 }}>{p.name}</div>
              <span
                className="px-2 py-0.5 rounded"
                style={{
                  fontSize: 9,
                  background: p.brand === "Amaron" ? "#2E0D0D" : "#2A2A2A",
                  color: p.brand === "Amaron" ? "#c00000" : "#666666",
                }}
              >
                {p.brand}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>{p.type} · {p.spec}</div>
            <div className="flex items-end justify-between mt-3">
              <div>
                <div style={{ fontSize: 16 }}>{fmtINR(p.price)}</div>
                <div style={{ fontSize: 10, color: p.stock === "Low Stock" ? "#ef9f27" : "#22a850" }}>{p.stock}</div>
              </div>
              <Btn onClick={() => add(p.id)} size="sm">Add to Cart</Btn>
            </div>
          </div>
        ))}
      </div>

      {cartOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setCartOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[#1A1A1A] p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ borderLeft: "1px solid #2E2E2E" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontSize: 16 }}>Cart</h2>
              <button onClick={() => setCartOpen(false)}><X size={16} /></button>
            </div>
            {cartItems.length === 0 && <div style={{ fontSize: 12, color: "#9ca3af" }}>Cart is empty</div>}
            <div className="space-y-3">
              {cartItems.map((i) => (
                <div key={i.p.id} className="flex justify-between gap-2 pb-3" style={{ borderBottom: "0.5px solid #2E2E2E" }}>
                  <div>
                    <div style={{ fontSize: 12 }}>{i.p.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{fmtINR(i.p.price)} × {i.q}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(i.p.id, -1)} style={{ padding: 2 }}><X size={12} /></button>
                    <button onClick={() => updateQty(i.p.id, 1)} style={{ padding: 2 }}><Plus size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
            {cartItems.length > 0 && (
              <div className="mt-5">
                <div className="flex justify-between mb-3" style={{ fontSize: 14 }}>
                  <span>Subtotal</span><span>{fmtINR(subtotal)}</span>
                </div>
                <button
                  onClick={() => { setCart([]); setCartOpen(false); alert("Order placed (demo)"); }}
                  className="w-full py-2.5 rounded-md text-white"
                  style={{ background: "#c00000", fontSize: 13 }}
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =================== DEALER: ORDERS =================== */
export function MyOrders() {
  return (
    <div>
      <PageHeader title="My Orders" sub="Track every order placed with Amara Raja" />
      <CogniqBanner
        text="Based on your sales pattern, Amaron Pro 35Ah may run out in 9 days. Reorder now?"
        action="Reorder"
      />
      <div className="card-base overflow-x-auto">
        <table className="w-full" style={{ fontSize: 12 }}>
          <thead>
            <tr style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase", textAlign: "left" }}>
              <th className="py-2 pr-3">Order ID</th><th className="py-2 pr-3">Date</th>
              <th className="py-2 pr-3">Items</th><th className="py-2 pr-3">Total</th>
              <th className="py-2 pr-3">Status</th><th className="py-2 pr-3">ETA</th><th></th>
            </tr>
          </thead>
          <tbody>
            {DEALER_ORDERS.map((o) => (
              <tr key={o.id} style={{ borderTop: "0.5px solid #2E2E2E" }}>
                <td className="py-2.5 pr-3">{o.id}</td>
                <td className="py-2.5 pr-3" style={{ color: "#9ca3af" }}>{o.date}</td>
                <td className="py-2.5 pr-3">{o.items}</td>
                <td className="py-2.5 pr-3">{fmtINR(o.total)}</td>
                <td className="py-2.5 pr-3"><StatusBadge status={o.status} /></td>
                <td className="py-2.5 pr-3" style={{ color: "#9ca3af" }}>{o.eta}</td>
                <td className="py-2.5"><Btn variant="ghost" size="sm">Track</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =================== DEALER: POS =================== */
export function POSEntry() {
  const today = new Date().toISOString().slice(0, 10);
  const [logs, setLogs] = useState<{ date: string; sku: string; qty: number; vehicle: string; notes: string }[]>([
    { date: today, sku: "Amaron Pro 35Ah 4W", qty: 2, vehicle: "Car", notes: "" },
    { date: today, sku: "Amaron Hi-Life 2.5Ah 2W", qty: 4, vehicle: "Bike", notes: "Repeat customer" },
  ]);
  const [form, setForm] = useState({ date: today, sku: PRODUCTS[0].name, qty: 1, vehicle: "Car", notes: "" });

  return (
    <div>
      <PageHeader title="POS Entry" sub="Log today's secondary sales for Cogniq forecasting" />
      <div className="grid lg:grid-cols-2 gap-4">
        <form
          className="card-base space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setLogs((l) => [{ ...form, qty: Number(form.qty) }, ...l]);
            setForm({ ...form, qty: 1, notes: "" });
          }}
        >
          <div>
            <label className="stat-label block mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "0.5px solid #2E2E2E", fontSize: 13 }} />
          </div>
          <div>
            <label className="stat-label block mb-1">Product (SKU)</label>
            <select value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "0.5px solid #2E2E2E", fontSize: 13, background: "#1A1A1A" }}>
              {PRODUCTS.map((p) => <option key={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label block mb-1">Quantity</label>
              <input type="number" min={1} value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "0.5px solid #2E2E2E", fontSize: 13 }} />
            </div>
            <div>
              <label className="stat-label block mb-1">Vehicle Type</label>
              <select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "0.5px solid #2E2E2E", fontSize: 13, background: "#1A1A1A" }}>
                <option>Car</option><option>Bike</option><option>Commercial</option>
              </select>
            </div>
          </div>
          <div>
            <label className="stat-label block mb-1">Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
              className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "0.5px solid #2E2E2E", fontSize: 13 }} />
          </div>
          <Btn type="submit">Log Sale</Btn>
        </form>

        <div className="card-base">
          <div className="stat-label mb-3">Today's entries</div>
          <table className="w-full" style={{ fontSize: 12 }}>
            <thead>
              <tr style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase", textAlign: "left" }}>
                <th className="py-2">SKU</th><th className="py-2">Qty</th><th className="py-2">Vehicle</th><th className="py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i} style={{ borderTop: "0.5px solid #2E2E2E" }}>
                  <td className="py-2">{l.sku}</td><td className="py-2">{l.qty}</td>
                  <td className="py-2">{l.vehicle}</td><td className="py-2" style={{ color: "#9ca3af" }}>{l.notes || "—"}</td>
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
  return (
    <div>
      <PageHeader title="Dealer Orders" sub="All orders across the channel" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        <StatCard label="Orders Today" value="18" change="+4 vs yesterday" accent="crimson" />
        <StatCard label="Total Value Today" value="₹14.6 L" change="+9% vs avg" accent="green" />
        <StatCard label="Pending Dispatch" value="7" change="2 over SLA" accent="amber" />
      </div>
      <div className="card-base overflow-x-auto">
        <table className="w-full" style={{ fontSize: 12 }}>
          <thead>
            <tr style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase", textAlign: "left" }}>
              <th className="py-2 pr-3">Dealer</th><th className="py-2 pr-3">Location</th>
              <th className="py-2 pr-3">Order ID</th><th className="py-2 pr-3">SKUs</th>
              <th className="py-2 pr-3">Value</th><th className="py-2 pr-3">Status</th><th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {REGIONAL_ORDERS.map((o) => (
              <tr key={o.id} style={{ borderTop: "0.5px solid #2E2E2E" }}>
                <td className="py-2.5 pr-3">{o.dealer}</td>
                <td className="py-2.5 pr-3" style={{ color: "#9ca3af" }}>{o.location}</td>
                <td className="py-2.5 pr-3">{o.id}</td>
                <td className="py-2.5 pr-3">{o.skus}</td>
                <td className="py-2.5 pr-3">{fmtINR(o.value)}</td>
                <td className="py-2.5 pr-3"><StatusBadge status={o.status} /></td>
                <td className="py-2.5" style={{ color: "#9ca3af" }}>{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =================== ADMIN/RSM: SECONDARY SALES =================== */
export function SecondarySales() {
  const max = Math.max(...SKU_SELLTHROUGH.map((s) => s.units));
  return (
    <div>
      <PageHeader title="Secondary Sales Intelligence" sub="POS data, sell-through and predictive stock-out alerts" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label="POS Entries This Week" value="1,284" change="+11% vs last week" accent="green" />
        <StatCard label="Top Selling SKU" value="Amaron Hi-Life" change="2,120 units" accent="crimson" />
        <StatCard label="Dormant Dealers (14d)" value="14" change="Follow-up needed" accent="amber" />
        <StatCard label="Stock-out Alerts" value="4" change="Predicted < 14 days" accent="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-5">
        <div className="card-base">
          <div className="stat-label mb-3">SKU sell-through (this month)</div>
          <div className="space-y-2.5">
            {SKU_SELLTHROUGH.map((s) => (
              <div key={s.sku}>
                <div className="flex justify-between" style={{ fontSize: 11 }}>
                  <span>{s.sku}</span><span style={{ color: "#9ca3af" }}>{s.units.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-2 rounded-full mt-1" style={{ background: "#2A2A2A" }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${(s.units / max) * 100}%`, background: s.type === "auto" ? "#c00000" : "#22a850" }} />
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
                style={{ borderBottom: "0.5px solid #2A2A2A" }}>
                <div className="flex items-center gap-2">
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: r.activity === "high" ? "#22a850" : r.activity === "medium" ? "#ef9f27" : "#c00000",
                  }} />
                  <span style={{ fontSize: 13 }}>{r.name}</span>
                </div>
                <span style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase" }}>{r.activity}</span>
              </div>
            ))}
          </div>
          <div className="mt-3" style={{ fontSize: 10, color: "#9ca3af" }}>
            Activity reflects POS entries logged in the last 7 days.
          </div>
        </div>
      </div>

      <CogniqPanel>
        <div className="space-y-2.5">
          {[
            "Amaron Pro 35Ah is trending 23% above forecast in NCR. Consider increasing allocation.",
            "14 dealers in Maharashtra have not logged POS data in 7 days. Follow-up recommended.",
            "Powerzone 45Ah stock-out predicted in Tamil Nadu within 12 days at current sell rate.",
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded bg-[#1A1A1A]" style={{ border: "0.5px solid #3A3470" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#534ab7", marginTop: 6, flexShrink: 0 }} />
              <div className="flex-1" style={{ fontSize: 12 }}>{t}</div>
              <Btn variant="ghost" size="sm">Dismiss</Btn>
              <Btn variant="purple" size="sm">Take Action</Btn>
            </div>
          ))}
        </div>
      </CogniqPanel>

      <div className="card-base mt-5 overflow-x-auto">
        <div className="stat-label mb-3">Stock-out Alerts</div>
        <table className="w-full" style={{ fontSize: 12 }}>
          <thead>
            <tr style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase", textAlign: "left" }}>
              <th className="py-2 pr-3">Dealer</th><th className="py-2 pr-3">Region</th>
              <th className="py-2 pr-3">SKU</th><th className="py-2 pr-3">Days to Stock-out</th>
              <th className="py-2 pr-3">Current Stock</th><th className="py-2 pr-3">Reorder Qty</th><th></th>
            </tr>
          </thead>
          <tbody>
            {STOCKOUT_ALERTS.map((a, i) => (
              <tr key={i} style={{ borderTop: "0.5px solid #2E2E2E" }}>
                <td className="py-2.5 pr-3">{a.dealer}</td>
                <td className="py-2.5 pr-3" style={{ color: "#9ca3af" }}>{a.region}</td>
                <td className="py-2.5 pr-3">{a.sku}</td>
                <td className="py-2.5 pr-3"><span className="badge-risk" style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10 }}>{a.days} days</span></td>
                <td className="py-2.5 pr-3">{a.current}</td>
                <td className="py-2.5 pr-3">{a.reorder}</td>
                <td className="py-2.5"><Btn size="sm">Alert Dealer</Btn></td>
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
  return (
    <div>
      <PageHeader title="Cognilix Dashboard" sub="Unified demand and channel intelligence" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label="Dealer Orders (MTD)" value="₹14.82 Cr" change="+8% vs last month" accent="crimson" />
        <StatCard label="Industrial Revenue (MTD)" value="₹6.41 Cr" change="+12% vs last month" accent="green" />
        <StatCard label="Critical Sites" value="8" change="Across 3 customers" accent="amber" />
        <StatCard label="Replacement Pipeline (60d)" value="₹12.4 L" change="14 units · 6 sites" accent="amber" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4 mb-5">
        <div className="card-base" style={{ borderTop: "2px solid #c00000" }}>
          <div className="stat-label mb-3">Dealer channel — top regions</div>
          <div className="space-y-2.5">
            {[
              { r: "NCR", v: "₹4.82 Cr" },
              { r: "Tamil Nadu", v: "₹3.41 Cr" },
              { r: "Maharashtra", v: "₹2.94 Cr" },
              { r: "Karnataka", v: "₹2.10 Cr" },
              { r: "Telangana", v: "₹1.55 Cr" },
            ].map((x, i) => (
              <div key={i} className="flex justify-between" style={{ fontSize: 13, borderBottom: "0.5px solid #2A2A2A", paddingBottom: 6 }}>
                <span>{x.r}</span><span>{x.v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-base" style={{ borderTop: "2px solid #22a850" }}>
          <div className="stat-label mb-3">Industrial — customer mix</div>
          <div className="space-y-2.5">
            {[
              { c: "Indus Towers", v: "₹3.62 Cr", share: 56 },
              { c: "BSNL", v: "₹1.94 Cr", share: 30 },
              { c: "Hitachi UPS Solutions", v: "₹0.85 Cr", share: 14 },
            ].map((x, i) => (
              <div key={i}>
                <div className="flex justify-between" style={{ fontSize: 13 }}>
                  <span>{x.c}</span><span>{x.v}</span>
                </div>
                <div className="h-1.5 rounded-full mt-1" style={{ background: "#2A2A2A" }}>
                  <div className="h-full rounded-full" style={{ width: `${x.share}%`, background: "#22a850" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <CogniqPanel>
        <div className="space-y-2.5">
          {[
            "NCR demand for Amaron Pro 35Ah trending 23% above forecast — consider stock reallocation.",
            "Indus Towers contract INDT-2024-002 will exhaust 3 weeks before expiry at current rate.",
            "8 sites at Critical risk — total 32 units; estimated 30-day replacement value ₹6.8 L.",
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded bg-[#1A1A1A]" style={{ border: "0.5px solid #3A3470" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#534ab7", marginTop: 6 }} />
              <div className="flex-1" style={{ fontSize: 12 }}>{t}</div>
            </div>
          ))}
        </div>
      </CogniqPanel>
    </div>
  );
}

/* =================== RSM DASHBOARD =================== */
export function RSMDashboard() {
  return (
    <div>
      <PageHeader title="My Region — NCR & North India" sub="Dealer performance, demand trends, and Cogniq recommendations" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
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
  const totalUnits = SITES.reduce((s, x) => s + x.units, 0);
  const atRisk = SITES.filter((s) => s.status === "At Risk").reduce((s, x) => s + x.units, 0);
  const critical = SITES.filter((s) => s.status === "Critical").reduce((s, x) => s + x.units, 0);

  return (
    <div>
      <PageHeader title="My Fleet Overview" sub="Indus Towers — battery health across all sites" />
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard label="Total Battery Units" value={String(totalUnits)} accent="green" />
        <StatCard label="Units at Risk" value={String(atRisk)} accent="amber" />
        <StatCard label="Critical Units" value={String(critical)} accent="crimson" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {SITES.map((s) => (
          <div key={s.id} className="card-base" style={{
            borderTop: `2px solid ${s.status === "Critical" ? "#c00000" : s.status === "At Risk" ? "#ef9f27" : "#22a850"}`,
          }}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div style={{ fontSize: 14 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.id} · {s.location}</div>
              </div>
              <StatusBadge status={s.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <div className="stat-label">Units</div>
                <div style={{ fontSize: 16 }}>{s.units}</div>
              </div>
              <div>
                <div className="stat-label">Last Inspection</div>
                <div style={{ fontSize: 12 }}>{s.lastInspection}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between mb-1" style={{ fontSize: 10, color: "#9ca3af" }}>
                <span>LIFE REMAINING</span><span>{s.lifeLeft}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "#2A2A2A" }}>
                <div className="h-full rounded-full"
                  style={{ width: `${s.lifeLeft}%`, background: s.lifeLeft < 30 ? "#c00000" : s.lifeLeft < 60 ? "#ef9f27" : "#22a850" }} />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Btn variant="ghost" size="sm" onClick={() => setOpenSite(s.id)}>View Details</Btn>
              <Btn variant="crimson" size="sm" onClick={() => setSrOpen(true)}>Raise Service Request</Btn>
            </div>
          </div>
        ))}
      </div>

      {openSite && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setOpenSite(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-[#1A1A1A] w-full sm:max-w-3xl rounded-t-xl sm:rounded-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} style={{ border: "0.5px solid #2E2E2E" }}>
            <div className="flex justify-between items-center px-5 py-4" style={{ borderBottom: "0.5px solid #2E2E2E" }}>
              <div>
                <h2 style={{ fontSize: 16 }}>{SITES.find((s) => s.id === openSite)?.name}</h2>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>Battery unit detail</div>
              </div>
              <button onClick={() => setOpenSite(null)}><X size={16} /></button>
            </div>
            <div className="p-5 overflow-x-auto">
              <table className="w-full" style={{ fontSize: 12 }}>
                <thead>
                  <tr style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase", textAlign: "left" }}>
                    <th className="py-2 pr-3">Unit ID</th><th className="py-2 pr-3">Model</th>
                    <th className="py-2 pr-3">Installed</th><th className="py-2 pr-3">Age</th>
                    <th className="py-2 pr-3">Life Used</th><th className="py-2 pr-3">Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {SITE_UNITS[openSite].map((u) => (
                    <tr key={u.unitId} style={{ borderTop: "0.5px solid #2E2E2E" }}>
                      <td className="py-2.5 pr-3">{u.unitId}</td>
                      <td className="py-2.5 pr-3">{u.model}</td>
                      <td className="py-2.5 pr-3" style={{ color: "#9ca3af" }}>{u.installed}</td>
                      <td className="py-2.5 pr-3">{u.ageMonths} mo</td>
                      <td className="py-2.5 pr-3" style={{ minWidth: 140 }}>
                        <div className="h-1.5 rounded-full" style={{ background: "#2A2A2A" }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${u.lifeUsed}%`, background: u.lifeUsed > 80 ? "#c00000" : u.lifeUsed > 60 ? "#ef9f27" : "#22a850" }} />
                        </div>
                        <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{u.lifeUsed}%</div>
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
      <div className="relative bg-[#1A1A1A] w-full max-w-md rounded-xl p-5" onClick={(e) => e.stopPropagation()} style={{ border: "0.5px solid #2E2E2E" }}>
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ fontSize: 16 }}>Raise Service Request</h2>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Service request submitted (demo)");
            onClose();
          }}
        >
          <div>
            <label className="stat-label block mb-1">Site</label>
            <select className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "0.5px solid #2E2E2E", fontSize: 13, background: "#1A1A1A" }}>
              {SITES.map((s) => <option key={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="stat-label block mb-1">Unit ID</label>
            <select className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "0.5px solid #2E2E2E", fontSize: 13, background: "#1A1A1A" }}>
              <option>U-NCR041-01</option><option>U-NCR041-02</option><option>U-MH117-01</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label block mb-1">Request Type</label>
              <select className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "0.5px solid #2E2E2E", fontSize: 13, background: "#1A1A1A" }}>
                <option>Inspection</option><option>Replacement</option><option>Emergency</option>
              </select>
            </div>
            <div>
              <label className="stat-label block mb-1">Priority</label>
              <select className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "0.5px solid #2E2E2E", fontSize: 13, background: "#1A1A1A" }}>
                <option>Normal</option><option>High</option><option>Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="stat-label block mb-1">Description</label>
            <textarea rows={3} className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "0.5px solid #2E2E2E", fontSize: 13 }} />
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
  const total = ALL_FLEET_SITES.length;
  const critical = ALL_FLEET_SITES.filter((s) => s.status === "Critical").length;
  const risk = ALL_FLEET_SITES.filter((s) => s.status === "At Risk").length;
  return (
    <div>
      <PageHeader title="Fleet Health" sub="All managed sites across your industrial customers" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total Sites Managed" value={String(total)} accent="green" />
        <StatCard label="Critical Sites" value={String(critical)} accent="crimson" />
        <StatCard label="At Risk Sites" value={String(risk)} accent="amber" />
        <StatCard label="Replacement Pipeline" value="₹12.4 L" change="60-day forecast" accent="amber" />
      </div>

      <div className="card-base overflow-x-auto mb-5">
        <table className="w-full" style={{ fontSize: 12 }}>
          <thead>
            <tr style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase", textAlign: "left" }}>
              <th className="py-2 pr-3">Customer</th><th className="py-2 pr-3">Site</th>
              <th className="py-2 pr-3">Location</th><th className="py-2 pr-3">Units</th>
              <th className="py-2 pr-3">Status</th><th className="py-2 pr-3">Days Since Inspection</th>
              <th className="py-2 pr-3">Risk</th><th></th>
            </tr>
          </thead>
          <tbody>
            {ALL_FLEET_SITES.map((s, i) => (
              <tr key={i} style={{ borderTop: "0.5px solid #2E2E2E" }}>
                <td className="py-2.5 pr-3">{s.customer}</td>
                <td className="py-2.5 pr-3">{s.site}</td>
                <td className="py-2.5 pr-3" style={{ color: "#9ca3af" }}>{s.location}</td>
                <td className="py-2.5 pr-3">{s.units}</td>
                <td className="py-2.5 pr-3"><StatusBadge status={s.status} /></td>
                <td className="py-2.5 pr-3">{s.days}</td>
                <td className="py-2.5 pr-3"><StatusBadge status={s.risk} /></td>
                <td className="py-2.5"><Btn variant="ghost" size="sm">View</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CogniqBanner
        text="14 units across 6 sites are predicted to require replacement within 60 days. Estimated replacement value: ₹12.4 lakhs."
        action="View Pipeline"
      />
    </div>
  );
}

/* =================== IAM: CUSTOMERS DASHBOARD =================== */
export function IAMCustomers() {
  return (
    <div>
      <PageHeader title="My Customers" sub="Indus Towers · BSNL · Hitachi UPS Solutions" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label="Customers" value="3" accent="green" />
        <StatCard label="Active Sites" value="8" change="2 critical" accent="crimson" />
        <StatCard label="Active Contracts" value="4" change="1 expiring < 60d" accent="amber" />
        <StatCard label="60-day Pipeline" value="₹12.4 L" accent="amber" />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-5">
        {[
          { c: "Indus Towers", sites: 4, units: 22, contracts: 2, status: "Critical" },
          { c: "BSNL", sites: 2, units: 22, contracts: 1, status: "Critical" },
          { c: "Hitachi UPS Solutions", sites: 2, units: 14, contracts: 1, status: "At Risk" },
        ].map((x) => (
          <div key={x.c} className="card-base" style={{
            borderTop: `2px solid ${x.status === "Critical" ? "#c00000" : "#ef9f27"}`,
          }}>
            <div className="flex justify-between items-start">
              <div style={{ fontSize: 14 }}>{x.c}</div>
              <StatusBadge status={x.status} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div>
                <div className="stat-label">Sites</div>
                <div style={{ fontSize: 16 }}>{x.sites}</div>
              </div>
              <div>
                <div className="stat-label">Units</div>
                <div style={{ fontSize: 16 }}>{x.units}</div>
              </div>
              <div>
                <div className="stat-label">Contracts</div>
                <div style={{ fontSize: 16 }}>{x.contracts}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CogniqPanel>
        <div className="space-y-2" style={{ fontSize: 12 }}>
          <div>• Indus Towers contract INDT-2024-002 expiring in 46 days — propose renewal this week.</div>
          <div>• BSNL BSNL-KA-09 has 6 critical units — schedule joint inspection.</div>
          <div>• Hitachi utilisation only 31% on HUS-2025-007 — book usage review.</div>
        </div>
      </CogniqPanel>
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
      <div className="grid md:grid-cols-2 gap-4">
        {mine.map((c) => {
          const days = daysToExpiry(c.end);
          const urgent = days < 60;
          return (
            <div key={c.id} className="card-base" style={{ borderTop: urgent ? "2px solid #ef9f27" : "2px solid #22a850" }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div style={{ fontSize: 14 }}>{c.id}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{c.product} · {fmtINR(c.rate)}/unit</div>
                </div>
                <span className={urgent ? "badge-risk" : "badge-good"} style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10 }}>
                  {days} days to expiry
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div><div className="stat-label">Total</div><div style={{ fontSize: 14 }}>{c.total}</div></div>
                <div><div className="stat-label">Consumed</div><div style={{ fontSize: 14 }}>{c.consumed}</div></div>
                <div><div className="stat-label">Remaining</div><div style={{ fontSize: 14 }}>{c.remaining}</div></div>
              </div>
              <div className="mt-3">
                <div className="h-1.5 rounded-full" style={{ background: "#2A2A2A" }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${(c.consumed / c.total) * 100}%`, background: urgent ? "#ef9f27" : "#22a850" }} />
                </div>
                <div className="flex justify-between mt-1" style={{ fontSize: 10, color: "#9ca3af" }}>
                  <span>{c.start}</span><span>{c.end}</span>
                </div>
              </div>
              {c.id === "INDT-2024-002" && (
                <div className="mt-3 p-2.5 rounded" style={{ background: "#14142A", border: "1px solid #3A3470" }}>
                  <div className="flex items-start gap-2">
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#534ab7", marginTop: 5 }} />
                    <div style={{ fontSize: 11, color: "#AFA9EC" }}>
                      At current consumption rate, this contract will be exhausted 3 weeks before expiry. Consider raising a new contract or emergency order.
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <Btn variant="ghost" size="sm">View Orders</Btn>
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

  return (
    <div>
      <PageHeader title="Place Release Order" sub="Order against an active rate contract" />
      <div className="grid lg:grid-cols-3 gap-4">
        <form
          className="card-base lg:col-span-2 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!overage) alert("Release order placed (demo)");
          }}
        >
          <div>
            <label className="stat-label block mb-1">Contract</label>
            <select value={contractId} onChange={(e) => setContractId(e.target.value)}
              className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "0.5px solid #2E2E2E", fontSize: 13, background: "#1A1A1A" }}>
              {mine.map((c) => <option key={c.id} value={c.id}>{c.id} — {c.product}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label block mb-1">Delivery Site</label>
              <select value={site} onChange={(e) => setSite(e.target.value)}
                className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "0.5px solid #2E2E2E", fontSize: 13, background: "#1A1A1A" }}>
                {SITES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="stat-label block mb-1">Requested Delivery Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "0.5px solid #2E2E2E", fontSize: 13 }} />
            </div>
          </div>
          <div>
            <label className="stat-label block mb-1">Product</label>
            <input value={contract.product} disabled
              className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "0.5px solid #2E2E2E", fontSize: 13, background: "#2A2A2A" }} />
          </div>
          <div>
            <label className="stat-label block mb-1">Quantity</label>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "0.5px solid #2E2E2E", fontSize: 13 }} />
            {overage && (
              <div style={{ fontSize: 11, color: "#c00000", marginTop: 4 }}>
                Quantity exceeds contract balance ({contract.remaining} units remaining).
              </div>
            )}
          </div>
          <div>
            <label className="stat-label block mb-1">Special Instructions</label>
            <textarea rows={3} className="w-full px-3 py-2 rounded-md outline-none" style={{ border: "0.5px solid #2E2E2E", fontSize: 13 }} />
          </div>
          <Btn type="submit" disabled={overage}>Submit Release Order</Btn>
        </form>

        <div className="card-base h-fit" style={{ borderTop: "2px solid #534ab7" }}>
          <div className="stat-label mb-3">Order Summary</div>
          <div className="space-y-2" style={{ fontSize: 12 }}>
            <div className="flex justify-between"><span style={{ color: "#9ca3af" }}>Contract</span><span>{contract.id}</span></div>
            <div className="flex justify-between"><span style={{ color: "#9ca3af" }}>Product</span><span>{contract.product}</span></div>
            <div className="flex justify-between"><span style={{ color: "#9ca3af" }}>Rate</span><span>{fmtINR(contract.rate)}/unit</span></div>
            <div className="flex justify-between"><span style={{ color: "#9ca3af" }}>Quantity</span><span>{qty}</span></div>
            <div className="flex justify-between" style={{ borderTop: "0.5px solid #2E2E2E", paddingTop: 8, fontSize: 14 }}>
              <span>Order Total</span><span>{fmtINRLakh(qty * contract.rate)}</span>
            </div>
            <div className="flex justify-between" style={{ color: "#9ca3af" }}><span>Balance after</span><span>{contract.remaining - qty} units</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =================== IAM/ADMIN: ALL CONTRACTS =================== */
export function AllContracts() {
  const daysToExpiry = (end: string) => {
    const [d, m, y] = end.split(" ");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(m);
    return Math.round((new Date(Number(y), months, Number(d)).getTime() - Date.now()) / 86400000);
  };
  return (
    <div>
      <PageHeader title="Contracts" sub="All active rate contracts across customers" />
      <div className="card-base overflow-x-auto">
        <table className="w-full" style={{ fontSize: 12 }}>
          <thead>
            <tr style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase", textAlign: "left" }}>
              <th className="py-2 pr-3">Customer</th><th className="py-2 pr-3">Contract</th>
              <th className="py-2 pr-3">Product</th><th className="py-2 pr-3">Total</th>
              <th className="py-2 pr-3">Consumed</th><th className="py-2 pr-3">Remaining</th>
              <th className="py-2 pr-3">Expiry</th><th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {CONTRACTS.map((c) => {
              const days = daysToExpiry(c.end);
              const color = days < 30 ? "#c00000" : days < 60 ? "#ef9f27" : "#22a850";
              return (
                <tr key={c.id} style={{ borderTop: "0.5px solid #2E2E2E" }}>
                  <td className="py-2.5 pr-3">{c.customer}</td>
                  <td className="py-2.5 pr-3">{c.id}</td>
                  <td className="py-2.5 pr-3">{c.product}</td>
                  <td className="py-2.5 pr-3">{c.total}</td>
                  <td className="py-2.5 pr-3">{c.consumed}</td>
                  <td className="py-2.5 pr-3">{c.remaining}</td>
                  <td className="py-2.5 pr-3" style={{ color }}>{c.end} ({days}d)</td>
                  <td className="py-2.5"><Btn variant="ghost" size="sm">Manage</Btn></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
