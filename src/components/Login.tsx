import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { PROFILES, type Profile } from "@/lib/mock-data";

export function Login() {
  const { setProfile } = useApp();
  const [selected, setSelected] = useState<Profile | "">("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#000000" }}>
      <div
        className="w-full max-w-md"
        style={{
          padding: 36,
          borderRadius: 14,
          background: "linear-gradient(180deg, #3D44E0 0%, #2B31B8 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 30px 80px -20px rgba(61,68,224,0.5), 0 1px 0 rgba(255,255,255,0.08) inset",
        }}
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <span style={{ color: "#FFFFFF", fontSize: 16, letterSpacing: "0.15em", fontWeight: 600 }}>COGNILIX</span>
          <span style={{ width: 1, height: 20, background: "rgba(255,255,255,0.3)" }} />
          <span style={{ color: "#C6F24E", fontSize: 14 }}>Amara Raja</span>
        </div>
        <h1 style={{ fontSize: 22, color: "#FFFFFF" }} className="text-center">Welcome back</h1>
        <p className="text-center mt-1" style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
          Select your profile to continue
        </p>

        <div className="mt-8">
          <label className="block mb-2" style={{ fontSize: 9, textTransform: "uppercase", color: "rgba(255,255,255,0.7)", letterSpacing: "0.06em" }}>Select Profile</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value as Profile)}
            className="w-full px-3 py-2 rounded-md outline-none"
            style={{ border: "1px solid #26262F", background: "#16161D", fontSize: 14, color: "#FFFFFF" }}
          >
            <option value="">Choose a profile...</option>
            {PROFILES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <button
            disabled={!selected}
            onClick={() => selected && setProfile(selected as Profile)}
            className="w-full mt-6 py-2.5 rounded-md text-white transition-opacity"
            style={{ background: "#c00000", fontSize: 14, opacity: selected ? 1 : 0.5 }}
          >
            Login
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5B5BF5" }} />
          <span style={{ fontSize: 11, color: "#9ca3af" }}>Powered by Cogniq AI</span>
        </div>
      </div>
    </div>
  );
}
