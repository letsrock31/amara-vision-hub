import { ReactNode } from "react";

export function StatCard({
  label, value, change, accent = "none",
}: { label: string; value: string; change?: string; accent?: "crimson" | "green" | "amber" | "none" }) {
  const top =
    accent === "crimson" ? "#c00000" :
    accent === "green" ? "#B8E94A" :
    accent === "amber" ? "#ef9f27" : "transparent";
  return (
    <div className="card-base" style={{ borderTop: accent === "none" ? "0.5px solid #26262F" : `2px solid ${top}` }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value mt-1.5">{value}</div>
      {change && (
        <div className="stat-change mt-1" style={{ color: top === "transparent" ? "#9ca3af" : top }}>
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
    <span className={cls} style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10 }}>
      {status}
    </span>
  );
}

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h1 style={{ fontSize: 20 }}>{title}</h1>
      {sub && <p style={{ fontSize: 12, color: "#9ca3af" }} className="mt-0.5">{sub}</p>}
    </div>
  );
}

export function CogniqPanel({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ background: "#161734", border: "1px solid #3D3FA8" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5B5BF5" }} />
        <span style={{ fontSize: 11, color: "#C7C9FF", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Cogniq AI Insights
        </span>
      </div>
      {children}
    </div>
  );
}

export function CogniqBanner({ text, action }: { text: string; action?: string }) {
  return (
    <div
      className="rounded-lg p-3 flex items-start gap-3 mb-4"
      style={{ background: "#161734", border: "1px solid #3D3FA8" }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5B5BF5", marginTop: 6, flexShrink: 0 }} />
      <div className="flex-1" style={{ fontSize: 12, color: "#C7C9FF" }}>{text}</div>
      {action && (
        <button
          className="px-3 py-1 rounded-md text-white whitespace-nowrap"
          style={{ background: "#5B5BF5", fontSize: 11 }}
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
  const bg = variant === "crimson" ? "#C00000" : variant === "green" ? "#B8E94A" : variant === "purple" ? "#5B5BF5" : "transparent";
  const color = variant === "ghost" ? "#9CA3AF" : "#FFFFFF";
  const border = variant === "ghost" ? "0.5px solid #26262F" : "none";
  const padding = size === "sm" ? "4px 10px" : "6px 14px";
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ background: bg, color, border, padding, borderRadius: 6, fontSize: 12, opacity: disabled ? 0.5 : 1 }}
    >
      {children}
    </button>
  );
}
