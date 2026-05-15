import { ReactNode, useState } from "react";
import { toast } from "sonner";
import { X, CheckCircle2, Download, Phone, Mail, Star } from "lucide-react";
import { Btn, StatusBadge } from "./ui-bits";
import { useApp, genId } from "@/lib/app-context";
import { fmtINR, SKU_SELLTHROUGH } from "@/lib/mock-data";

/* ================== PRIMITIVES (sticky — no outside-click close) ================== */

export function CenterModal({ children, widthClass = "max-w-lg" }: { children: ReactNode; widthClass?: string }) {
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

export function RightDrawer({ title, sub, onClose, children }: { title: string; sub?: string; onClose: () => void; children: ReactNode }) {
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

export function ModalHeader({ title, sub, onClose, accent = "indigo" }: { title: string; sub?: string; onClose: () => void; accent?: "indigo" | "white" }) {
  return (
    <div className="px-5 py-4 flex justify-between items-start" style={{ borderBottom: "1px solid #E5E7EB", background: accent === "indigo" ? "#EEF0FF" : "#FFFFFF" }}>
      <div>
        <h3 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h3>
        {sub && <div style={{ fontSize: 12, color: "#4B5563", marginTop: 2 }}>{sub}</div>}
      </div>
      <button onClick={onClose}><X size={18} /></button>
    </div>
  );
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="px-5 py-3 flex justify-end gap-2" style={{ borderTop: "1px solid #E5E7EB", background: "#F9FAFB" }}>
      {children}
    </div>
  );
}

export const inputStyle = { border: "1px solid #D1D5DB", fontSize: 13, background: "#FFFFFF", padding: "8px 10px", borderRadius: 6, width: "100%" } as const;

/* ================== STAGE TIMELINE ================== */

const TRACK_STAGES = ["Order Placed", "Warehouse Confirmed", "Dispatched from Warehouse", "Out for Delivery", "Delivered"];

export function activeIndexFor(status: string) {
  if (status === "Delivered") return 4;
  if (status === "Out for Delivery") return 3;
  if (status === "Dispatched") return 2;
  if (status === "Processing" || status === "Confirmed") return 1;
  return 0;
}

export function StageTimeline({ status }: { status: string }) {
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
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: done ? color : "#FFFFFF", border: `2px solid ${color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: isCurrent ? "pulse 1.6s infinite" : undefined,
              }}>
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

/* ================== TRACK ORDER MODAL ================== */

export function TrackOrderModal({ orderId, status, eta, date, onClose }: { orderId: string; status: string; eta: string; date?: string; onClose: () => void }) {
  return (
    <CenterModal widthClass="max-w-xl">
      <ModalHeader title={`Track Order ${orderId}`} sub={date ? `Placed on ${date}` : undefined} onClose={onClose} />
      <div className="p-5 overflow-y-auto">
        <StageTimeline status={status} />
        <div className="mt-4 p-3 rounded space-y-1.5" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: 13 }}>
          <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Carrier</span><span style={{ fontWeight: 600 }}>Moglix Express Logistics</span></div>
          <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Tracking Number</span><span style={{ fontWeight: 600 }}>MGL-4421987</span></div>
          <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Estimated Delivery</span><span style={{ fontWeight: 700 }}>{eta}</span></div>
        </div>
      </div>
      <ModalFooter><Btn variant="ghost" size="sm" onClick={onClose}>Close</Btn></ModalFooter>
    </CenterModal>
  );
}

/* ================== INVOICE PANEL ================== */

export function InvoicePanel({ orderId, total, items, onClose }: { orderId: string; total: number; items?: { name: string; qty: number; unitPrice: number }[]; onClose: () => void }) {
  const invoiceId = "INV-" + orderId.replace(/\D/g, "").slice(-4);
  const subtotal = total / 1.18;
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  return (
    <RightDrawer title="Tax Invoice" sub={invoiceId} onClose={onClose}>
      <div className="space-y-1.5 mb-4" style={{ fontSize: 13 }}>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Invoice No</span><span style={{ fontWeight: 700 }}>{invoiceId}</span></div>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Order Ref</span><span style={{ fontWeight: 600 }}>{orderId}</span></div>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Date</span><span>{new Date().toLocaleDateString("en-IN")}</span></div>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Billing</span><span>Sharma Auto Parts, Delhi</span></div>
        <div className="flex justify-between"><span style={{ color: "#4B5563" }}>Shipping</span><span style={{ textAlign: "right", maxWidth: 280 }}>Shop 14, Chandni Chowk Market, Delhi 110006</span></div>
      </div>
      <div className="rounded-lg overflow-hidden mb-4" style={{ border: "1px solid #E5E7EB" }}>
        <table className="w-full" style={{ fontSize: 12 }}>
          <thead style={{ background: "#F9FAFB" }}>
            <tr style={{ color: "#4B5563", textTransform: "uppercase", textAlign: "left" }}>
              <th className="py-2 px-3">Item</th><th className="py-2 px-3">HSN</th><th className="py-2 px-3">Qty</th><th className="py-2 px-3" style={{ textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? [{ name: "Order line items", qty: 1, unitPrice: subtotal }]).map((it, i) => (
              <tr key={i} style={{ borderTop: "1px solid #E5E7EB" }}>
                <td className="py-2 px-3">{it.name}</td>
                <td className="py-2 px-3">85071000</td>
                <td className="py-2 px-3">{it.qty}</td>
                <td className="py-2 px-3" style={{ textAlign: "right", fontWeight: 600 }}>{fmtINR(it.unitPrice * it.qty)}</td>
              </tr>
            ))}
            <tr style={{ borderTop: "1px solid #E5E7EB" }}><td className="py-2 px-3" colSpan={3} style={{ color: "#4B5563" }}>Subtotal</td><td className="py-2 px-3" style={{ textAlign: "right" }}>{fmtINR(subtotal)}</td></tr>
            <tr><td className="py-2 px-3" colSpan={3} style={{ color: "#4B5563" }}>CGST 9%</td><td className="py-2 px-3" style={{ textAlign: "right" }}>{fmtINR(cgst)}</td></tr>
            <tr><td className="py-2 px-3" colSpan={3} style={{ color: "#4B5563" }}>SGST 9%</td><td className="py-2 px-3" style={{ textAlign: "right" }}>{fmtINR(sgst)}</td></tr>
            <tr style={{ background: "#F9FAFB", borderTop: "1px solid #E5E7EB" }}><td className="py-2 px-3" colSpan={3} style={{ fontWeight: 700 }}>Total</td><td className="py-2 px-3" style={{ textAlign: "right", fontWeight: 700 }}>{fmtINR(total)}</td></tr>
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Btn size="sm" onClick={() => toast.success("Invoice downloaded")}><Download size={14} style={{ display: "inline", marginRight: 4 }} /> Download Invoice</Btn>
        <Btn variant="ghost" size="sm" onClick={onClose}>Close</Btn>
      </div>
    </RightDrawer>
  );
}

/* ================== COMPLAINT MODAL ================== */

export function ComplaintModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { addComplaint, addNotification } = useApp();
  const [type, setType] = useState("Wrong Product Delivered");
  const [priority, setPriority] = useState("Normal");
  const [desc, setDesc] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) { toast.error("Please add a description"); return; }
    const id = genId("CMP");
    addComplaint({ id, orderId, type, priority, description: desc, status: "Open", raised: new Date().toLocaleDateString("en-IN") });
    addNotification(`Complaint ${id} raised for order ${orderId}`, "complaint");
    setDone(id);
  };
  return (
    <CenterModal widthClass="max-w-md">
      <ModalHeader title="Raise a Complaint" sub={`Order ${orderId}`} onClose={onClose} accent="white" />
      <div className="p-5">
        {done ? (
          <div className="text-center py-3">
            <CheckCircle2 size={48} color="#15803D" style={{ margin: "0 auto" }} />
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 12 }}>Complaint {done} submitted</div>
            <div style={{ fontSize: 13, color: "#4B5563", marginTop: 8 }}>Our support team will respond within 24 hours.</div>
            <div className="mt-5"><Btn onClick={onClose}>Close</Btn></div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="stat-label block mb-1">Complaint Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                <option>Wrong Product Delivered</option><option>Damaged Product</option><option>Quantity Short</option><option>Delayed Delivery</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="stat-label block mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
                <option>Normal</option><option>Urgent</option>
              </select>
            </div>
            <div>
              <label className="stat-label block mb-1">Description</label>
              <textarea required rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} style={inputStyle} placeholder="Describe the issue…" />
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

/* ================== ESCALATE MODAL ================== */

export function EscalateModal({ refId, kind = "Order", reasons, onClose }: { refId: string; kind?: string; reasons?: string[]; onClose: () => void }) {
  const { addNotification } = useApp();
  const opts = reasons ?? ["Delivery Delayed", "Quality Issue", "Wrong Items", "Other"];
  const [reason, setReason] = useState(opts[0]);
  const [urgency, setUrgency] = useState("Normal");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = genId("ESC");
    addNotification(`Escalation ${id} raised for ${kind.toLowerCase()} ${refId}`, "escalation");
    setDone(id);
  };
  return (
    <CenterModal widthClass="max-w-md">
      <ModalHeader title={`Escalate ${kind} ${refId}`} onClose={onClose} accent="white" />
      <div className="p-5">
        {done ? (
          <div className="text-center py-3">
            <CheckCircle2 size={48} color="#15803D" style={{ margin: "0 auto" }} />
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 12 }}>Escalation {done} created</div>
            <div style={{ fontSize: 13, color: "#4B5563", marginTop: 8 }}>Your account manager has been notified.</div>
            <div className="mt-5"><Btn onClick={onClose}>Close</Btn></div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="stat-label block mb-1">Escalation Reason</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)} style={inputStyle}>
                {opts.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="stat-label block mb-1">Urgency</label>
              <select value={urgency} onChange={(e) => setUrgency(e.target.value)} style={inputStyle}>
                <option>Normal</option><option>High</option><option>Critical</option>
              </select>
            </div>
            <div>
              <label className="stat-label block mb-1">Additional Notes</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} style={inputStyle} />
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

/* ================== UNIT HISTORY MODAL ================== */

export function UnitHistoryModal({ unitId, model, installed, isCritical, onClose }: { unitId: string; model: string; installed: string; isCritical: boolean; onClose: () => void }) {
  const events = [
    { date: installed, text: `${model} installed` },
    { date: "6 months later", text: "Routine inspection: performance normal" },
    ...(isCritical ? [{ date: "Recent", text: "Inspection: battery degradation detected, replacement recommended" }] : []),
  ];
  return (
    <CenterModal widthClass="max-w-md">
      <ModalHeader title={`Unit History: ${unitId}`} sub={model} onClose={onClose} />
      <div className="p-5">
        <div className="space-y-3">
          {events.map((e, i) => (
            <div key={i} className="flex gap-3">
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: i === events.length - 1 && isCritical ? "#C00000" : "#15803D", marginTop: 5 }} />
              <div>
                <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>{e.date}</div>
                <div style={{ fontSize: 14 }}>{e.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ModalFooter><Btn variant="ghost" size="sm" onClick={onClose}>Close</Btn></ModalFooter>
    </CenterModal>
  );
}

/* ================== PRODUCT DETAIL MODAL ================== */

export function ProductDetailModal({ product, onClose, onAdd }: { product: any; onClose: () => void; onAdd: () => void }) {
  const warranty = product.brand === "Amaron" ? "36 months" : product.brand === "Powerzone" ? "24 months" : "24 months";
  const compat = product.type === "4W"
    ? ["Maruti Swift Dzire", "Hyundai i20", "Tata Nexon", "Honda City"]
    : product.type === "2W"
    ? ["Honda Activa", "TVS Jupiter", "Hero Splendor", "Bajaj Pulsar"]
    : ["Telecom Towers", "UPS Systems", "Industrial Backup"];
  return (
    <CenterModal widthClass="max-w-2xl">
      <ModalHeader title={product.name} sub={`${product.brand} · ${product.type}`} onClose={onClose} />
      <div className="p-5 overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-4">
          <img src={product.image} alt={product.name} style={{ width: "100%", borderRadius: 8, border: "1px solid #E5E7EB" }} />
          <div className="space-y-2.5" style={{ fontSize: 13 }}>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded" style={{ background: "#0A0A0F", color: "#FFFFFF", fontSize: 10, fontWeight: 700 }}>{product.brand}</span>
              <span className="px-2 py-0.5 rounded" style={{ background: "#E5E7EB", fontSize: 10, fontWeight: 700 }}>{product.type}</span>
            </div>
            <div><div className="stat-label">Specification</div><div>{product.spec}</div></div>
            <div><div className="stat-label">Price</div><div style={{ fontSize: 22, fontWeight: 700 }}>{fmtINR(product.price)}</div></div>
            <div><div className="stat-label">Stock</div><div style={{ color: product.stock === "Low Stock" ? "#EF9F27" : "#15803D", fontWeight: 600 }}>{product.stock}</div></div>
            <div><div className="stat-label">Warranty</div><div style={{ fontWeight: 600 }}>{warranty}</div></div>
            <div>
              <div className="stat-label">Compatible Models</div>
              <ul style={{ fontSize: 13, paddingLeft: 18, listStyle: "disc" }}>
                {compat.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
            <button onClick={() => toast.success("Datasheet downloaded")} style={{ fontSize: 12, color: "#2B31B8", fontWeight: 600 }}>
              <Download size={12} style={{ display: "inline", marginRight: 4 }} /> Download Datasheet
            </button>
          </div>
        </div>
      </div>
      <ModalFooter>
        <Btn variant="ghost" size="sm" onClick={onClose}>Close</Btn>
        <Btn size="sm" onClick={() => { onAdd(); onClose(); }}>Add to Cart</Btn>
      </ModalFooter>
    </CenterModal>
  );
}

/* ================== SKU DETAIL MODAL ================== */

export function SkuDetailModal({ sku, onClose }: { sku: string; onClose: () => void }) {
  const total = SKU_SELLTHROUGH.find((s) => s.sku === sku)?.units ?? 1000;
  const factor = total / 1840;
  const weeks = [320, 410, 390, 490].map((w) => Math.round(w * factor));
  return (
    <CenterModal widthClass="max-w-xl">
      <ModalHeader title={sku} sub={`Total this month: ${total.toLocaleString("en-IN")} units`} onClose={onClose} />
      <div className="p-5 overflow-y-auto">
        <div className="stat-label mb-2">Weekly trend (last 4 weeks)</div>
        <div className="flex items-end gap-3 h-32 mb-5 px-2">
          {weeks.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div style={{ width: "100%", height: `${(w / Math.max(...weeks)) * 100}%`, background: "#5B5BF5", borderRadius: 4, minHeight: 8 }} />
              <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600 }}>W{i + 1}</div>
              <div style={{ fontSize: 11, fontWeight: 700 }}>{w}</div>
            </div>
          ))}
        </div>
        <div className="stat-label mb-2">Top 3 dealers</div>
        <div className="space-y-2 mb-4">
          {[
            { d: "Sharma Auto Parts", u: 284 },
            { d: "Mehta Motors", u: 201 },
            { d: "Sri Venkat Electricals", u: 178 },
          ].map((x) => (
            <div key={x.d} className="flex justify-between p-2 rounded" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: 13 }}>
              <span style={{ fontWeight: 600 }}>{x.d}</span><span>{x.u} units</span>
            </div>
          ))}
        </div>
        <div className="rounded p-3" style={{ background: "#EEF0FF", border: "1px solid #C7CCF7", fontSize: 12, color: "#2B31B8" }}>
          <strong>Cogniq Forecast:</strong> +18% growth expected over next 30 days based on seasonal trend. Stock-out risk in NCR in 9 days.
        </div>
      </div>
      <ModalFooter><Btn variant="ghost" size="sm" onClick={onClose}>Close</Btn></ModalFooter>
    </CenterModal>
  );
}

/* ================== REGION DETAIL MODAL ================== */

export function RegionDetailModal({ region, onClose }: { region: string; onClose: () => void }) {
  return (
    <CenterModal widthClass="max-w-xl">
      <ModalHeader title={`Region: ${region}`} sub="Channel performance" onClose={onClose} />
      <div className="p-5 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { l: "Total Dealers", v: "12" }, { l: "Active Dealers", v: "9" }, { l: "Dormant Dealers", v: "3" },
          ].map((x) => (
            <div key={x.l} className="p-3 rounded" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
              <div className="stat-label">{x.l}</div><div style={{ fontSize: 22, fontWeight: 700 }}>{x.v}</div>
            </div>
          ))}
        </div>
        <div className="stat-label mb-2">Top SKUs</div>
        <div className="rounded mb-4" style={{ border: "1px solid #E5E7EB" }}>
          <table className="w-full" style={{ fontSize: 12 }}>
            <thead style={{ background: "#F9FAFB" }}><tr style={{ color: "#4B5563", textTransform: "uppercase", textAlign: "left" }}><th className="py-2 px-3">SKU</th><th className="py-2 px-3">Units</th><th className="py-2 px-3">Trend</th></tr></thead>
            <tbody>
              {SKU_SELLTHROUGH.slice(0, 4).map((s, i) => (
                <tr key={s.sku} style={{ borderTop: "1px solid #E5E7EB" }}>
                  <td className="py-2 px-3" style={{ fontWeight: 600 }}>{s.sku}</td>
                  <td className="py-2 px-3">{s.units}</td>
                  <td className="py-2 px-3" style={{ color: i % 2 === 0 ? "#15803D" : "#C00000" }}>{i % 2 === 0 ? "▲ +12%" : "▼ -4%"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="stat-label mb-2">Dealers in {region}</div>
        <div className="rounded" style={{ border: "1px solid #E5E7EB" }}>
          <table className="w-full" style={{ fontSize: 12 }}>
            <thead style={{ background: "#F9FAFB" }}><tr style={{ color: "#4B5563", textTransform: "uppercase", textAlign: "left" }}><th className="py-2 px-3">Dealer</th><th className="py-2 px-3">Last Order</th><th className="py-2 px-3">Status</th></tr></thead>
            <tbody>
              {[
                { d: "Sharma Auto Parts", lo: "9 May", s: "Dormant" },
                { d: "Mehta Motors", lo: "14 May", s: "Active" },
                { d: "Patel Power Hub", lo: "12 May", s: "Active" },
              ].map((x) => (
                <tr key={x.d} style={{ borderTop: "1px solid #E5E7EB" }}>
                  <td className="py-2 px-3" style={{ fontWeight: 600 }}>{x.d}</td><td className="py-2 px-3">{x.lo}</td>
                  <td className="py-2 px-3"><StatusBadge status={x.s === "Active" ? "Good" : "At Risk"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ModalFooter><Btn variant="ghost" size="sm" onClick={onClose}>Close</Btn></ModalFooter>
    </CenterModal>
  );
}

/* ================== SCHEDULE / FORM MODALS ================== */

export function FormModal({ title, fields, confirmLabel = "Submit", successText, onClose }: {
  title: string; fields: { name: string; label: string; type: "text" | "textarea" | "select" | "date"; options?: string[]; defaultValue?: string }[];
  confirmLabel?: string; successText: (vals: Record<string, string>) => string; onClose: () => void;
}) {
  const [vals, setVals] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? (f.type === "select" ? f.options?.[0] ?? "" : "")]))
  );
  const [done, setDone] = useState<string | null>(null);
  const set = (n: string, v: string) => setVals((p) => ({ ...p, [n]: v }));
  const submit = (e: React.FormEvent) => { e.preventDefault(); setDone(successText(vals)); };
  return (
    <CenterModal widthClass="max-w-md">
      <ModalHeader title={title} onClose={onClose} accent="white" />
      <div className="p-5">
        {done ? (
          <div className="text-center py-3">
            <CheckCircle2 size={48} color="#15803D" style={{ margin: "0 auto" }} />
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>{done}</div>
            <div className="mt-5"><Btn onClick={onClose}>Close</Btn></div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="stat-label block mb-1">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea rows={3} value={vals[f.name]} onChange={(e) => set(f.name, e.target.value)} style={inputStyle} />
                ) : f.type === "select" ? (
                  <select value={vals[f.name]} onChange={(e) => set(f.name, e.target.value)} style={inputStyle}>
                    {f.options!.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type} value={vals[f.name]} onChange={(e) => set(f.name, e.target.value)} style={inputStyle} />
                )}
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="ghost" size="sm" onClick={onClose}>Cancel</Btn>
              <Btn type="submit">{confirmLabel}</Btn>
            </div>
          </form>
        )}
      </div>
    </CenterModal>
  );
}

/* ================== STAR RATING ================== */

export function StarRating({ onSubmit }: { onSubmit: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const [val, setVal] = useState(0);
  const [done, setDone] = useState(false);
  if (done) return <div style={{ fontSize: 13, color: "#15803D", fontWeight: 600 }}>Thank you for your feedback!</div>;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setVal(n)} aria-label={`${n} star`}>
            <Star size={20} fill={(hover || val) >= n ? "#F59E0B" : "transparent"} color={(hover || val) >= n ? "#F59E0B" : "#9CA3AF"} />
          </button>
        ))}
      </div>
      {val > 0 && <Btn size="sm" onClick={() => { onSubmit(val); setDone(true); }}>Submit</Btn>}
    </div>
  );
}

/* ================== CONTACT DEALER PANEL ================== */

export function ContactDealerCard({ dealer, location }: { dealer: string; location: string }) {
  const phone = "+91 98110 " + (dealer.length * 117 % 90000 + 10000).toString().slice(0, 5);
  const email = dealer.toLowerCase().replace(/[^a-z0-9]+/g, "") + "@dealer.com";
  return (
    <div className="rounded-lg p-3 mt-3" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
      <div className="stat-label mb-2">Contact Dealer</div>
      <div className="space-y-1.5" style={{ fontSize: 13 }}>
        <div><strong>{dealer}</strong></div>
        <div style={{ color: "#4B5563" }}>Owner / Primary Contact</div>
        <div className="flex items-center gap-2"><Phone size={12} /> {phone}</div>
        <div className="flex items-center gap-2"><Mail size={12} /> {email}</div>
        <div style={{ color: "#4B5563" }}>{location}</div>
      </div>
    </div>
  );
}
