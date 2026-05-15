import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { PROFILES, type Profile } from "@/lib/mock-data";

export function Login() {
  const { setProfile } = useApp();
  const [selected, setSelected] = useState<Profile | "">("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#f2f2f0" }}>
      <div className="w-full max-w-md card-base" style={{ padding: 32 }}>
        <div className="flex items-center justify-center gap-3 mb-8">
          <span style={{ color: "#c00000", fontSize: 16, letterSpacing: "0.15em" }}>COGNILIX</span>
          <span style={{ width: 1, height: 20, background: "#e5e5e0" }} />
          <span style={{ color: "#22a850", fontSize: 14 }}>Amara Raja</span>
        </div>
        <h1 style={{ fontSize: 20 }} className="text-center">Welcome back</h1>
        <p className="text-center mt-1" style={{ fontSize: 13, color: "#9ca3af" }}>
          Select your profile to continue
        </p>

        <div className="mt-8">
          <label className="stat-label block mb-2">Select Profile</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value as Profile)}
            className="w-full px-3 py-2 rounded-md outline-none"
            style={{ border: "0.5px solid #e5e5e0", background: "#fff", fontSize: 14 }}
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
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#534ab7" }} />
          <span style={{ fontSize: 11, color: "#9ca3af" }}>Powered by Cogniq AI</span>
        </div>
      </div>
    </div>
  );
}
