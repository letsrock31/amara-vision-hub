import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useApp } from "@/lib/app-context";
import type { Profile } from "@/lib/mock-data";

const CHIPS: Record<Profile, { q: string; a: string }[]> = {
  "ARE&M Admin": [
    { q: "Which region has the highest dealer order volume this month?", a: "NCR leads with ₹4.82 Cr in dealer orders this month — 23% above the 6-month average. Tamil Nadu is second at ₹3.41 Cr." },
    { q: "How many battery sites are at critical risk right now?", a: "8 sites are currently classified as Critical risk across all customers — primarily Indus Towers (NCR-041) and BSNL (BSNL-KA-09). Combined, they hold 32 units flagged for replacement within 45 days." },
    { q: "What is the total replacement pipeline value?", a: "Estimated 60-day replacement pipeline: ₹12.4 lakhs across 14 units in 6 sites. 90-day pipeline expands to ₹38.6 lakhs (47 units)." },
    { q: "Which dealers have been dormant for more than 2 weeks?", a: "14 dealers have not logged POS data in the last 14+ days — 9 in Maharashtra, 3 in Karnataka, 2 in Telangana. Recommend RSM follow-up." },
    { q: "Show demand forecast for next 30 days", a: "30-day forecast: Amaron Pro 35Ah +18%, Amaron Hi-Life +9%, Powerzone 45Ah −4%. Industrial Quanta 150Ah expected to grow 12% driven by Indus Towers replacement cycle." },
  ],
  "Regional Sales Manager": [
    { q: "Which dealers in my region have not ordered this week?", a: "In NCR & North India: Sharma Auto Parts (Delhi) – last order 9 days ago, Mehta Motors (Ahmedabad) – 11 days ago. Recommend immediate follow-up." },
    { q: "What is the sell-through rate for Amaron Pro 35Ah in my region?", a: "Amaron Pro 35Ah sell-through in NCR & North: 84% (1,840 units sold against 2,190 dispatched in last 30 days). 23% above national average." },
    { q: "Which SKU is at risk of stock-out in my region?", a: "Amaron Pro 35Ah at Sharma Auto Parts is forecast to stock-out in 9 days. Powerzone 45Ah across 3 NCR dealers projected stock-out in 12-15 days." },
    { q: "Show my region's secondary sales trend this month", a: "NCR secondary sales: 4,210 units this month, +14% vs last month. Automotive 4W leads with 62% share, 2W at 31%, Industrial at 7%." },
    { q: "Which dealer should I prioritise for follow-up today?", a: "Top priority: Sharma Auto Parts (Delhi) — high-volume dealer, 9 days dormant, projected stock-out in 9 days on Amaron Pro 35Ah. Estimated lost revenue if delayed: ₹1.68 L." },
  ],
  "Dealer": [
    { q: "What should I reorder this week based on my sales?", a: "Based on your last 30 days: Reorder Amaron Pro 35Ah ×40 units (9 days of stock left), Powerzone 45Ah ×20 units (low stock). Estimated reorder value ~₹2.4 L." },
    { q: "Where is my last order and when will it arrive?", a: "Order ORD-7860 (Amaron Hi-Life ×24) is Processing — dispatched 16 May, ETA 20 May 2026. Order ORD-7855 (Quanta 150Ah ×2) ETA 19 May 2026." },
    { q: "What is the current price of Amaron Pro 35Ah?", a: "Amaron Pro 35Ah 4W is currently ₹4,200/unit. Volume discount: 3% on orders of 25+ units, 5% on 50+." },
    { q: "How many days of stock do I have left for my top SKUs?", a: "Amaron Pro 35Ah: 9 days, Amaron Hi-Life 2.5Ah: 21 days, Powerzone 45Ah: 6 days, Amaron FreshPack 60Ah: 18 days." },
    { q: "Are there any ongoing promotions or trade schemes for me?", a: "Active: 'Summer Boost' — additional 2% credit on Amaron 4W SKUs over ₹2 L (valid till 31 May). Powerzone trade-in scheme: ₹150 per old battery returned." },
  ],
  "Industrial Account Manager": [
    { q: "Which of my customer sites are at critical or high risk?", a: "Critical: Indus Towers NCR-041 (Delhi), BSNL BSNL-KA-09 (Bengaluru). High risk: Indus Towers MH-117 (Pune), Hitachi HUS-DL-02 (Delhi). Total 24 units flagged." },
    { q: "What is my replacement pipeline for the next 60 days?", a: "60-day pipeline: 14 units across 6 sites, estimated ₹12.4 L revenue. Largest opportunity: Indus Towers NCR-041 — 4 units, ~₹7.0 L." },
    { q: "Which customer contract is closest to expiry?", a: "Indus Towers INDT-2024-002 (AmaronVolt 200Ah) expires 30 Jun 2026 — 46 days. At current consumption rate, will exhaust 3 weeks before expiry." },
    { q: "Show me all pending service requests across my customers", a: "7 open service requests: 4 Indus Towers (3 Inspections, 1 Replacement), 2 BSNL (both Replacement), 1 Hitachi (Inspection). Average age: 4.2 days." },
    { q: "Which customer has the lowest contract utilisation this quarter?", a: "Hitachi UPS Solutions: 31% utilisation on HUS-2025-007 (95/300 units). Below target of 45%. Recommend usage review meeting." },
  ],
  "Industrial Customer": [
    { q: "Which of my sites have batteries at risk of failure?", a: "Tower Site NCR-041 (Delhi) — Critical, 6 units, 88% avg life used. Tower Site MH-117 (Pune) — At Risk, 4 units, 55% avg life used. Recommend inspection within 14 days." },
    { q: "When is my contract with Amara Raja expiring?", a: "INDT-2024-002 (AmaronVolt 200Ah) expires 30 Jun 2026 — 46 days remaining, only 20 units left. INDT-2024-001 (Quanta 150Ah) expires 15 Aug 2026 with 188 units remaining." },
    { q: "How many battery units are due for replacement in 30 days?", a: "6 units due for replacement in 30 days — all at Tower Site NCR-041 (Delhi). Estimated replacement value: ₹10.5 L." },
    { q: "What is my remaining contract quantity?", a: "INDT-2024-001 Quanta 150Ah: 188 units remaining of 500. INDT-2024-002 AmaronVolt 200Ah: 20 units remaining of 200." },
    { q: "Raise a service request for one of my sites", a: "Sure — open the My Sites screen, choose the site, and click 'Raise Service Request' on any unit. I can pre-fill NCR-041 since 3 units there are Critical. Want me to draft it?" },
  ],
};

type Msg = { role: "user" | "ai"; text: string };

export function Cogniq() {
  const { profile } = useApp();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  if (!profile) return null;
  const chips = CHIPS[profile];

  const send = (q: string, a?: string) => {
    const ans =
      a ??
      "I've noted your question. Based on current Cognilix data, I'd recommend reviewing the relevant module for the latest figures. (Demo response)";
    setMsgs((m) => [...m, { role: "user", text: q }, { role: "ai", text: ans }]);
    setInput("");
  };

  return (
    <>
      {open && (
        <div
          className="fixed bottom-20 right-4 md:right-6 z-50 flex flex-col"
          style={{
            width: "min(380px, calc(100vw - 32px))",
            height: "min(540px, calc(100vh - 120px))",
            maxHeight: "65vh",
            background: "#14142A",
            border: "1px solid #3A3470",
            borderRadius: 12,
            boxShadow: "0 10px 40px rgba(83,74,183,0.45)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #2E2E2E" }}>
            <div className="flex items-center gap-2">
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#534ab7" }} />
              <span style={{ fontSize: 13, color: "#FFFFFF" }}>Cogniq AI</span>
              <span style={{ fontSize: 10, color: "#9ca3af" }}>Powered by Cogniq</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close">
              <X size={16} color="#9ca3af" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {msgs.length === 0 && (
              <div style={{ fontSize: 11, color: "#9ca3af" }} className="px-1 pb-1">
                Try one of these, or ask anything:
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className="px-3 py-2 rounded-lg max-w-[85%]"
                  style={{
                    fontSize: 12,
                    background: m.role === "user" ? "#2E0D0D" : "#1A1A3A",
                    color: m.role === "user" ? "#C00000" : "#AFA9EC",
                    border: m.role === "ai" ? "1px solid #3A3470" : "none",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 space-y-2" style={{ borderTop: "1px solid #2E2E2E" }}>
            <div className="flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <button
                  key={c.q}
                  onClick={() => send(c.q, c.a)}
                  className="px-2 py-1 rounded-full"
                  style={{
                    fontSize: 10,
                    background: "#1A1A3A",
                    color: "#AFA9EC",
                    border: "0.5px solid #3A3470",
                  }}
                >
                  {c.q.length > 50 ? c.q.slice(0, 48) + "…" : c.q}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) send(input.trim());
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Cogniq anything..."
                className="flex-1 px-3 py-2 rounded-md outline-none"
                style={{ border: "1px solid #3A3470", fontSize: 12, background: "#1A1A1A", color: "#FFFFFF" }}
              />
              <button
                type="submit"
                className="px-3 rounded-md text-white"
                style={{ background: "#534ab7" }}
                aria-label="Send"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
        style={{ background: "#534AB7" }}
        aria-label="Open Cogniq AI"
      >
        <MessageCircle size={20} />
      </button>
    </>
  );
}
