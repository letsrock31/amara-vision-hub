import { useApp } from "@/lib/app-context";
import type { Profile } from "@/lib/mock-data";
import {
  LayoutDashboard, Package, ShoppingCart, FileText, Building2,
  TrendingUp, Activity, ScrollText, Home, ClipboardList, MapPin, Truck, BarChart3,
} from "lucide-react";
import { useState } from "react";

type NavItem = { id: string; label: string; icon: React.ComponentType<{ size?: number; color?: string }>; section: string };

export const NAV_BY_PROFILE: Record<Profile, NavItem[]> = {
  "ARE&M Admin": [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
    { id: "dealer-orders", label: "Dealer Orders", icon: Truck, section: "Channels" },
    { id: "secondary-sales", label: "Secondary Sales", icon: BarChart3, section: "Channels" },
    { id: "fleet-health", label: "Fleet Health", icon: Activity, section: "Industrial" },
    { id: "contracts", label: "Contracts", icon: ScrollText, section: "Industrial" },
  ],
  "Regional Sales Manager": [
    { id: "dashboard", label: "My Region", icon: LayoutDashboard, section: "Overview" },
    { id: "dealer-orders", label: "Dealer Orders", icon: Truck, section: "Channels" },
    { id: "secondary-sales", label: "Secondary Sales", icon: BarChart3, section: "Channels" },
  ],
  "Dealer": [
    { id: "home", label: "Home", icon: Home, section: "Overview" },
    { id: "catalog", label: "Product Catalog", icon: Package, section: "Commerce" },
    { id: "orders", label: "My Orders", icon: ShoppingCart, section: "Commerce" },
    { id: "pos", label: "POS Entry", icon: ClipboardList, section: "Sales" },
  ],
  "Industrial Account Manager": [
    { id: "customers", label: "My Customers", icon: Building2, section: "Overview" },
    { id: "fleet-health", label: "Fleet Health", icon: Activity, section: "Operations" },
    { id: "contracts", label: "Contracts", icon: ScrollText, section: "Procurement" },
  ],
  "Industrial Customer": [
    { id: "sites", label: "My Sites", icon: MapPin, section: "Operations" },
    { id: "contracts", label: "My Contracts", icon: FileText, section: "Procurement" },
    { id: "release-order", label: "Place Release Order", icon: TrendingUp, section: "Procurement" },
  ],
};

function NavBtn({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  const [hover, setHover] = useState(false);
  const color = active ? "#FFFFFF" : hover ? "#FFFFFF" : "rgba(255,255,255,0.72)";
  const iconColor = active ? "#C6F24E" : hover ? "#FFFFFF" : "rgba(255,255,255,0.72)";
  const bg = active ? "rgba(255,255,255,0.12)" : hover ? "rgba(255,255,255,0.06)" : "transparent";
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="w-full flex items-center gap-2.5 px-4 py-2 transition-colors"
      style={{
        borderLeft: active ? "2px solid #C6F24E" : "2px solid transparent",
        background: bg,
        color,
        fontSize: 12,
        fontWeight: active ? 500 : 400,
      }}
    >
      <Icon size={14} color={iconColor} />
      <span>{item.label}</span>
    </button>
  );
}

export function Sidebar({ mobileOpen, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const { profile, view, setView } = useApp();
  if (!profile) return null;
  const items = NAV_BY_PROFILE[profile];
  const sections = Array.from(new Set(items.map((i) => i.section)));

  const content = (
    <>
      <div className="px-4 py-4">
        <div style={{ fontSize: 9, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", letterSpacing: "0.08em", fontWeight: 500 }}>
          {profile}
        </div>
      </div>
      {sections.map((sec) => (
        <div key={sec} className="mb-3">
          <div className="px-4 mb-1.5" style={{ fontSize: 9, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", fontWeight: 500 }}>
            {sec}
          </div>
          {items.filter((i) => i.section === sec).map((item) => (
            <NavBtn
              key={item.id}
              item={item}
              active={view === item.id}
              onClick={() => { setView(item.id); onClose?.(); }}
            />
          ))}
        </div>
      ))}
    </>
  );

  const sidebarBg = "linear-gradient(180deg, #3D44E0 0%, #3138C4 100%)";

  return (
    <>
      <aside
        className="hidden md:block fixed left-0 top-[52px] bottom-0 z-30 overflow-y-auto"
        style={{ width: 180, background: sidebarBg, borderRight: "0.5px solid rgba(255,255,255,0.08)" }}
      >
        {content}
      </aside>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50" onClick={onClose}>
          <div className="absolute inset-0 bg-black/50" />
          <aside
            className="absolute left-0 top-[52px] bottom-0 overflow-y-auto"
            style={{ width: 220, background: sidebarBg, borderRight: "0.5px solid rgba(255,255,255,0.08)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
