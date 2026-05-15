import { useState, useEffect, useRef } from "react";
import { useApp } from "@/lib/app-context";
import { PROFILES, type Profile } from "@/lib/mock-data";
import { ChevronDown, LogOut, Menu } from "lucide-react";

const initials = (p: Profile) =>
  p.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { profile, setProfile } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center px-5 gap-3"
      style={{ height: 52, background: "#111111", borderBottom: "0.5px solid #222222" }}
    >
      <button
        className="md:hidden text-white mr-1"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>
      <span style={{ color: "#C00000", fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase" }}>COGNILIX</span>
      <span style={{ width: 1, height: 18, background: "#333333" }} />
      <span style={{ color: "#22A850", fontSize: 13 }}>Amara Raja</span>
      <div className="flex-1" />
      <div
        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
        style={{ background: "#14142A", border: "1px solid #3A3470" }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#534AB7" }} />
        <span style={{ fontSize: 11, color: "#AFA9EC" }}>Cogniq active</span>
      </div>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-2 py-1 rounded-md"
          style={{ background: "#1A1A1A", border: "0.5px solid #2E2E2E" }}
        >
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-white"
            style={{ background: "#C00000", fontSize: 10 }}
          >
            {profile ? initials(profile) : "?"}
          </span>
          <span style={{ fontSize: 12, color: "#FFFFFF" }} className="hidden sm:inline">
            {profile}
          </span>
          <ChevronDown size={14} color="#9CA3AF" />
        </button>
        {open && (
          <div
            className="absolute right-0 mt-1 w-56 rounded-md shadow-lg py-1 z-50"
            style={{ background: "#1A1A1A", border: "0.5px solid #2E2E2E" }}
          >
            <div className="px-3 py-1.5" style={{ fontSize: 9, textTransform: "uppercase", color: "#444444" }}>
              Switch Profile
            </div>
            {PROFILES.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setProfile(p);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2"
                style={{ fontSize: 12, color: p === profile ? "#C00000" : "#FFFFFF", background: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#222222")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ background: p === profile ? "#C00000" : "#666666", fontSize: 9 }}
                >
                  {initials(p)}
                </span>
                {p}
              </button>
            ))}
            <div style={{ borderTop: "0.5px solid #2E2E2E" }} className="mt-1 pt-1">
              <button
                onClick={() => {
                  setProfile(null);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2"
                style={{ fontSize: 12, color: "#9CA3AF" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#222222")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut size={12} /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
