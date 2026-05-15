import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { PROFILES, type Profile } from "@/lib/mock-data";
import { ChevronDown, LogOut, Menu } from "lucide-react";

const initials = (p: Profile) =>
  p.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { profile, setProfile } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex" style={{ height: 52 }}>
      <div className="flex-1 flex items-center px-5 gap-3" style={{ background: "#c00000" }}>
        <button
          className="md:hidden text-white mr-1"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <span style={{ color: "#fff", fontSize: 13, letterSpacing: "0.15em" }}>COGNILIX</span>
        <span style={{ width: 1, height: 18, background: "rgba(255,255,255,0.5)" }} />
        <span style={{ color: "#fff", fontSize: 13 }}>Amara Raja</span>
      </div>
      <div className="flex-1 flex items-center justify-end px-5 gap-3" style={{ background: "#22a850" }}>
        <div
          className="hidden sm:flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full"
          style={{ border: "1px solid #cecbf6" }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#534ab7" }} />
          <span style={{ fontSize: 11, color: "#534ab7" }}>Cogniq active</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 bg-white px-2 py-1 rounded-md"
            style={{ border: "0.5px solid #e5e5e0" }}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
              style={{ background: "#c00000", fontSize: 10 }}
            >
              {profile ? initials(profile) : "?"}
            </span>
            <span style={{ fontSize: 12, color: "#111" }} className="hidden sm:inline">
              {profile}
            </span>
            <ChevronDown size={14} color="#9ca3af" />
          </button>
          {open && (
            <div
              className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg py-1 z-50"
              style={{ border: "0.5px solid #e5e5e0" }}
            >
              <div className="px-3 py-1.5" style={{ fontSize: 9, textTransform: "uppercase", color: "#9ca3af" }}>
                Switch Profile
              </div>
              {PROFILES.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setProfile(p);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                  style={{ fontSize: 12, color: p === profile ? "#c00000" : "#111" }}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                    style={{ background: p === profile ? "#c00000" : "#9ca3af", fontSize: 9 }}
                  >
                    {initials(p)}
                  </span>
                  {p}
                </button>
              ))}
              <div style={{ borderTop: "0.5px solid #e5e5e0" }} className="mt-1 pt-1">
                <button
                  onClick={() => {
                    setProfile(null);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                  style={{ fontSize: 12, color: "#9ca3af" }}
                >
                  <LogOut size={12} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
