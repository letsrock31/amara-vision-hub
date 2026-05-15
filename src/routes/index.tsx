import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppProvider, useApp } from "@/lib/app-context";
import { Login } from "@/components/Login";
import { Header } from "@/components/Header";
import { Sidebar, NAV_BY_PROFILE } from "@/components/Sidebar";
import { Cogniq } from "@/components/Cogniq";
import {
  AdminDashboard, RSMDashboard, DealerOrdersAdmin, SecondarySales,
  IAMFleetHealth, IAMCustomers, AllContracts,
  DealerHome, ProductCatalog, MyOrders, POSEntry,
  MySites, MyContracts, PlaceReleaseOrder,
} from "@/components/screens";

export const Route = createFileRoute("/")({
  component: () => (
    <AppProvider>
      <App />
    </AppProvider>
  ),
});

function App() {
  const { profile, view } = useApp();
  const [mobileNav, setMobileNav] = useState(false);

  if (!profile) return <Login />;

  const screen = (() => {
    if (profile === "ARE&M Admin") {
      if (view === "dashboard") return <AdminDashboard />;
      if (view === "dealer-orders") return <DealerOrdersAdmin />;
      if (view === "secondary-sales") return <SecondarySales />;
      if (view === "fleet-health") return <IAMFleetHealth />;
      if (view === "contracts") return <AllContracts />;
    }
    if (profile === "Regional Sales Manager") {
      if (view === "dashboard") return <RSMDashboard />;
      if (view === "dealer-orders") return <DealerOrdersAdmin />;
      if (view === "secondary-sales") return <SecondarySales />;
    }
    if (profile === "Dealer") {
      if (view === "home") return <DealerHome />;
      if (view === "catalog") return <ProductCatalog />;
      if (view === "orders") return <MyOrders />;
      if (view === "pos") return <POSEntry />;
    }
    if (profile === "Industrial Account Manager") {
      if (view === "customers") return <IAMCustomers />;
      if (view === "fleet-health") return <IAMFleetHealth />;
      if (view === "contracts") return <AllContracts />;
    }
    if (profile === "Industrial Customer") {
      if (view === "sites") return <MySites />;
      if (view === "contracts") return <MyContracts />;
      if (view === "release-order") return <PlaceReleaseOrder />;
    }
    return <div>Coming soon</div>;
  })();

  return (
    <div style={{ background: "#f2f2f0", minHeight: "100vh" }}>
      <Header onMenuClick={() => setMobileNav(true)} />
      <Sidebar mobileOpen={mobileNav} onClose={() => setMobileNav(false)} />
      <main className="md:ml-[180px] pt-[52px] pb-20 md:pb-6">
        <div className="p-4 md:p-6">{screen}</div>
      </main>
      <MobileBottomNav />
      <Cogniq />
    </div>
  );
}

function MobileBottomNav() {
  const { profile, view, setView } = useApp();
  if (!profile) return null;
  const items = NAV_BY_PROFILE[profile];
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-around"
      style={{ background: "#fff", borderTop: "1px solid #e5e5e0", height: 56 }}
    >
      {items.map((it) => {
        const Icon = it.icon;
        const active = view === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setView(it.id)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5"
            style={{ color: active ? "#c00000" : "#9ca3af" }}
          >
            <Icon size={18} />
            <span style={{ fontSize: 9 }}>{it.label.split(" ")[0]}</span>
          </button>
        );
      })}
    </nav>
  );
}
