import { useState, useEffect, useRef, useMemo } from "react";
import { useApp } from "@/lib/app-context";
import { PROFILES, type Profile, CONTRACTS, ALL_FLEET_SITES, REGIONAL_ORDERS } from "@/lib/mock-data";
import { ChevronDown, LogOut, Menu, Bell, Search, X } from "lucide-react";

const initials = (p: Profile) =>
  p.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const {
    profile, setProfile,
    notifications, markAllNotificationsRead, markNotificationRead,
    orders, setView, setSelectedContractId, setSelectedSiteId,
  } = useApp();
  const [open, setOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current && !ref.current.contains(t)) setOpen(false);
      if (bellRef.current && !bellRef.current.contains(t)) setBellOpen(false);
      if (searchRef.current && !searchRef.current.contains(t)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [] as { kind: string; label: string; sub: string; go: () => void }[];
    const out: { kind: string; label: string; sub: string; go: () => void }[] = [];
    orders.filter((o) => o.id.toLowerCase().includes(term)).slice(0, 4).forEach((o) =>
      out.push({ kind: "Order", label: o.id, sub: o.items, go: () => setView("orders") }));
    REGIONAL_ORDERS.filter((o) => o.id.toLowerCase().includes(term)).slice(0, 3).forEach((o) =>
      out.push({ kind: "Order", label: o.id, sub: `${o.dealer} · ${o.location}`, go: () => setView("dealer-orders") }));
    CONTRACTS.filter((c) => c.id.toLowerCase().includes(term) || c.product.toLowerCase().includes(term)).slice(0, 4).forEach((c) =>
      out.push({ kind: "Contract", label: c.id, sub: `${c.customer} · ${c.product}`, go: () => { setSelectedContractId(c.id); setView("contracts"); } }));
    ALL_FLEET_SITES.filter((s) => s.site.toLowerCase().includes(term) || s.location.toLowerCase().includes(term)).slice(0, 4).forEach((s) =>
      out.push({ kind: "Site", label: s.site, sub: `${s.customer} · ${s.location}`, go: () => { setSelectedSiteId(s.site); setView("fleet-health"); } }));
    return out.slice(0, 10);
  }, [q, orders, setView, setSelectedContractId, setSelectedSiteId]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center px-5 gap-3"
      style={{ height: 52, background: "#0F0F15", borderBottom: "0.5px solid #1E1E27" }}
    >
      <button className="md:hidden text-white mr-1" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={18} />
      </button>
      <span style={{ color: "#FFFFFF", fontSize: 16, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 800 }}>COGNILIX</span>
      <span style={{ width: 2, height: 22, background: "#FFFFFF", borderRadius: 1 }} />
      <span style={{ color: "#00A651", fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em" }}>Amara Raja</span>
      <div className="flex-1" />

      {/* Search */}
      {profile && (
        <div className="relative" ref={searchRef}>
          {searchOpen ? (
            <div className="flex items-center gap-2 px-2 py-1 rounded-md" style={{ background: "#16161D", border: "1px solid #26262F" }}>
              <Search size={14} color="#9CA3AF" />
              <input
                autoFocus value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search orders, contracts, sites…"
                style={{ background: "transparent", color: "#FFFFFF", fontSize: 12, outline: "none", border: "none", width: 220 }}
              />
              <button onClick={() => { setSearchOpen(false); setQ(""); }} aria-label="Close search">
                <X size={14} color="#9CA3AF" />
              </button>
              {results.length > 0 && (
                <div className="absolute right-0 mt-1 w-80 rounded-md shadow-xl py-1 z-50" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", top: "100%" }}>
                  {results.map((r, i) => (
                    <button key={i} onClick={() => { r.go(); setSearchOpen(false); setQ(""); }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50" style={{ borderBottom: i < results.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                      <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>{r.kind}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0F" }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: "#6B7280" }}>{r.sub}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-1.5 rounded-md" style={{ color: "#FFFFFF" }} aria-label="Search">
              <Search size={16} />
            </button>
          )}
        </div>
      )}

      {/* Cogniq active chip */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "#161734", border: "1px solid #3D3FA8" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5B5BF5" }} />
        <span style={{ fontSize: 11, color: "#C7C9FF" }}>Cogniq active</span>
      </div>

      {/* Bell */}
      {profile && (
        <div className="relative" ref={bellRef}>
          <button onClick={() => setBellOpen(!bellOpen)} className="relative p-1.5 rounded-md" style={{ color: "#FFFFFF" }} aria-label="Notifications">
            <Bell size={16} />
            {unread > 0 && (
              <span style={{
                position: "absolute", top: -2, right: -2, background: "#C00000", color: "#FFFFFF",
                fontSize: 9, fontWeight: 700, borderRadius: 999, minWidth: 16, height: 16,
                display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
              }}>{unread}</span>
            )}
          </button>
          {bellOpen && (
            <div className="absolute right-0 mt-1 rounded-md shadow-xl z-50" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", width: 360, top: "100%", maxHeight: 460, display: "flex", flexDirection: "column" }}>
              <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: "1px solid #E5E7EB" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications</span>
                <button onClick={() => markAllNotificationsRead()} style={{ fontSize: 11, color: "#2B31B8", fontWeight: 600 }}>
                  Mark all read
                </button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 400 }}>
                {notifications.length === 0 && (
                  <div className="px-4 py-8 text-center" style={{ fontSize: 12, color: "#6B7280" }}>No notifications</div>
                )}
                {notifications.map((n) => (
                  <button key={n.id} onClick={() => markNotificationRead(n.id)}
                    className="w-full text-left px-3 py-2.5 flex items-start gap-2 hover:bg-gray-50"
                    style={{ borderBottom: "1px solid #F3F4F6", opacity: n.read ? 0.6 : 1 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%", marginTop: 6, flexShrink: 0,
                      background: n.read ? "#D1D5DB" : (n.type === "alert" ? "#C00000" : n.type === "order" ? "#15803D" : "#5B5BF5"),
                    }} />
                    <div className="flex-1">
                      <div style={{ fontSize: 12.5, color: "#0A0A0F", fontWeight: n.read ? 400 : 600 }}>{n.text}</div>
                      <div style={{ fontSize: 10, color: "#6B7280", marginTop: 2 }}>{n.time}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile */}
      <div className="relative" ref={ref}>
        <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-2 py-1 rounded-md"
          style={{ background: "#16161D", border: "0.5px solid #26262F" }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ background: "#C00000", fontSize: 10 }}>
            {profile ? initials(profile) : "?"}
          </span>
          <span style={{ fontSize: 12, color: "#FFFFFF" }} className="hidden sm:inline">{profile}</span>
          <ChevronDown size={14} color="#9CA3AF" />
        </button>
        {open && (
          <div className="absolute right-0 mt-1 w-56 rounded-md shadow-lg py-1 z-50" style={{ background: "#16161D", border: "0.5px solid #26262F" }}>
            <div className="px-3 py-1.5" style={{ fontSize: 9, textTransform: "uppercase", color: "#444444" }}>Switch Profile</div>
            {PROFILES.map((p) => (
              <button key={p} onClick={() => { setProfile(p); setOpen(false); }}
                className="w-full text-left px-3 py-2 flex items-center gap-2"
                style={{ fontSize: 12, color: p === profile ? "#C00000" : "#FFFFFF", background: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1E1E27")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: p === profile ? "#C00000" : "#666666", fontSize: 9 }}>{initials(p)}</span>
                {p}
              </button>
            ))}
            <div style={{ borderTop: "0.5px solid #26262F" }} className="mt-1 pt-1">
              <button onClick={() => { setProfile(null); setOpen(false); }}
                className="w-full text-left px-3 py-2 flex items-center gap-2"
                style={{ fontSize: 12, color: "#9CA3AF" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1E1E27")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <LogOut size={12} /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
