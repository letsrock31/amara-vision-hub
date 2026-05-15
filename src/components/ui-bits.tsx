import { ReactNode, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useApp, type ActionRequest } from "@/lib/app-context";

export function StatCard({
  label, value, change, accent = "none",
}: { label: string; value: string; change?: string; accent?: "crimson" | "green" | "amber" | "none" }) {
  const top =
    accent === "crimson" ? "#C00000" :
    accent === "green" ? "#00A651" :
    accent === "amber" ? "#EF9F27" : "transparent";
  const changeBg =
    accent === "crimson" ? "#FEE2E2" :
    accent === "green" ? "#DCFCE7" :
    accent === "amber" ? "#FEF3C7" : "#F3F4F6";
  const changeColor =
    accent === "crimson" ? "#B91C1C" :
    accent === "green" ? "#15803D" :
    accent === "amber" ? "#B45309" : "#4B5563";
  return (
    <div className="card-base" style={{ borderTop: accent === "none" ? "1px solid #E5E7EB" : `3px solid ${top}` }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value mt-2">{value}</div>
      {change && (
        <div
          className="stat-change mt-2 inline-block px-2 py-0.5 rounded"
          style={{ background: changeBg, color: changeColor }}
        >
          {change}
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "Critical" ? "badge-critical" :
    status === "At Risk" || status === "High" || status === "Medium" ? "badge-risk" :
    status === "Good" || status === "Low" ? "badge-good" :
    status === "Processing" ? "badge-risk" :
    status === "Dispatched" ? "badge-risk" :
    status === "Delivered" ? "badge-good" : "badge-good";
  return (
    <span className={cls} style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11 }}>
      {status}
    </span>
  );
}

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>{title}</h1>
      {sub && <p style={{ fontSize: 14, color: "#4B5563" }} className="mt-1">{sub}</p>}
    </div>
  );
}

export function CogniqPanel({ children, title = "Cogniq AI Insights" }: { children: ReactNode; title?: string }) {
  return (
    <div
      className="rounded-lg p-4 mb-5"
      style={{ background: "#EEF0FF", border: "1px solid #C7CCF7" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#5B5BF5" }} />
        <span style={{ fontSize: 12, color: "#2B31B8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

/** Standard AI suggestions block — placed at top of every screen for consistency */
export function AISuggestions({ items }: { items: { text: string; action?: string; onAction?: () => void }[] }) {
  return (
    <CogniqPanel>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-2.5 rounded-md bg-white"
            style={{ border: "1px solid #E5E7EB" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5B5BF5", marginTop: 7, flexShrink: 0 }} />
            <div className="flex-1" style={{ fontSize: 13, color: "#0A0A0F" }}>{it.text}</div>
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => toast.message("Suggestion dismissed")}
            >
              Dismiss
            </Btn>
            {it.action && (
              <Btn variant="purple" size="sm" onClick={it.onAction ?? (() => toast.success(`${it.action} — action initiated`))}>
                {it.action}
              </Btn>
            )}
          </div>
        ))}
      </div>
    </CogniqPanel>
  );
}

export function CogniqBanner({ text, action, onAction }: { text: string; action?: string; onAction?: () => void }) {
  return (
    <div
      className="rounded-lg p-3 flex items-start gap-3 mb-4"
      style={{ background: "#EEF0FF", border: "1px solid #C7CCF7" }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5B5BF5", marginTop: 7, flexShrink: 0 }} />
      <div className="flex-1" style={{ fontSize: 13, color: "#0A0A0F" }}>{text}</div>
      {action && (
        <button
          onClick={onAction ?? (() => toast.success(`${action} — initiated`))}
          className="px-3 py-1.5 rounded-md text-white whitespace-nowrap"
          style={{ background: "#5B5BF5", fontSize: 12, fontWeight: 600 }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

export function Btn({
  children, variant = "crimson", onClick, type = "button", disabled, size = "md",
}: {
  children: ReactNode; variant?: "crimson" | "ghost" | "green" | "purple";
  onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; size?: "sm" | "md";
}) {
  const bg = variant === "crimson" ? "#C00000" : variant === "green" ? "#00A651" : variant === "purple" ? "#5B5BF5" : "transparent";
  const color = variant === "ghost" ? "#0A0A0F" : "#FFFFFF";
  const border = variant === "ghost" ? "1px solid #D1D5DB" : "none";
  const padding = size === "sm" ? "5px 12px" : "8px 16px";
  const fontSize = size === "sm" ? 12 : 13;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        background: bg,
        color,
        border,
        padding,
        borderRadius: 6,
        fontSize,
        fontWeight: 600,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

/** Filter bar — date range + category + product + search */
export function FilterBar({
  search, onSearch, dateRange, onDateRange, category, onCategory, categories,
  product, onProduct, products,
}: {
  search?: string; onSearch?: (v: string) => void;
  dateRange?: string; onDateRange?: (v: string) => void;
  category?: string; onCategory?: (v: string) => void; categories?: string[];
  product?: string; onProduct?: (v: string) => void; products?: string[];
}) {
  const inputStyle = { border: "1px solid #D1D5DB", fontSize: 13, background: "#FFFFFF", padding: "7px 10px", borderRadius: 6 } as const;
  return (
    <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-lg" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
      {onSearch && (
        <input
          value={search ?? ""}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search…"
          style={{ ...inputStyle, minWidth: 180 }}
        />
      )}
      {onDateRange && (
        <select value={dateRange ?? "30d"} onChange={(e) => onDateRange(e.target.value)} style={inputStyle}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      )}
      {onCategory && categories && (
        <select value={category ?? "All"} onChange={(e) => onCategory(e.target.value)} style={inputStyle}>
          <option value="All">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      )}
      {onProduct && products && (
        <select value={product ?? "All"} onChange={(e) => onProduct(e.target.value)} style={inputStyle}>
          <option value="All">All products</option>
          {products.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      )}
      <div className="flex-1" />
      <button
        onClick={() => toast.success("Export started — download will begin shortly")}
        style={{ ...inputStyle, fontWeight: 600, color: "#0A0A0F", cursor: "pointer" }}
      >
        Export CSV
      </button>
    </div>
  );
}

export function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 mt-3" style={{ fontSize: 12 }}>
      <span style={{ color: "#6B7280" }}>Page {page} of {totalPages}</span>
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        style={{ padding: "4px 10px", border: "1px solid #D1D5DB", borderRadius: 6, background: "#FFFFFF", opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? "not-allowed" : "pointer" }}
      >
        Prev
      </button>
      <button
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        style={{ padding: "4px 10px", border: "1px solid #D1D5DB", borderRadius: 6, background: "#FFFFFF", opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? "not-allowed" : "pointer" }}
      >
        Next
      </button>
    </div>
  );
}
