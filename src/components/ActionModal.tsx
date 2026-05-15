import { useEffect, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Btn } from "./ui-bits";

export function ActionModal() {
  const { action, closeAction } = useApp();
  const [values, setValues] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState<{ refId: string } | null>(null);

  useEffect(() => {
    if (action) {
      const init: Record<string, string | number> = {};
      action.fields?.forEach((f) => {
        if (f.defaultValue !== undefined) init[f.name] = f.defaultValue as any;
        else if (f.type === "select") init[f.name] = f.options[0];
        else if (f.type === "number") init[f.name] = 1;
        else init[f.name] = "";
      });
      setValues(init);
      setSubmitted(null);
    }
  }, [action]);

  if (!action) return null;

  const inputStyle = { border: "1px solid #D1D5DB", fontSize: 13, background: "#FFFFFF", padding: "8px 10px", borderRadius: 6, width: "100%" } as const;

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const refId = "REF-" + Math.floor(100000 + Math.random() * 900000);
    setSubmitted({ refId });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3" onClick={closeAction}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white w-full max-w-lg rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ border: "1px solid #E5E7EB", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        <div className="flex justify-between items-start px-5 py-4" style={{ borderBottom: "1px solid #E5E7EB", background: "#EEF0FF" }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0A0A0F" }}>{action.title}</h2>
            {action.description && <div style={{ fontSize: 12, color: "#4B5563", marginTop: 2 }}>{action.description}</div>}
          </div>
          <button onClick={closeAction} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto p-5">
          {submitted ? (
            <div className="text-center py-4">
              <CheckCircle2 size={48} color="#00A651" style={{ margin: "0 auto" }} />
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 12 }}>{action.successTitle ?? "Action completed"}</div>
              <div style={{ fontSize: 13, color: "#4B5563", marginTop: 6 }}>
                {action.successDescription ?? "Your request has been recorded successfully."}
              </div>
              <div className="mt-4 inline-block px-3 py-2 rounded" style={{ background: "#F3F4F6", fontSize: 13, fontWeight: 600 }}>
                Reference: {submitted.refId}
              </div>
              <div className="mt-5">
                <Btn onClick={closeAction}>Done</Btn>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              {action.summary && action.summary.length > 0 && (
                <div className="rounded p-3 mb-2" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                  {action.summary.map((s, i) => (
                    <div key={i} className="flex justify-between py-1" style={{ fontSize: 13 }}>
                      <span style={{ color: "#4B5563" }}>{s.label}</span>
                      <span style={{ fontWeight: 600 }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {action.fields?.map((f) => (
                <div key={f.name}>
                  <label className="stat-label block mb-1">{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      rows={3}
                      placeholder={(f as any).placeholder}
                      value={values[f.name] as string ?? ""}
                      onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                      style={inputStyle}
                    />
                  ) : f.type === "select" ? (
                    <select
                      value={values[f.name] as string ?? ""}
                      onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                      style={inputStyle}
                    >
                      {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      placeholder={(f as any).placeholder}
                      value={values[f.name] as any ?? ""}
                      onChange={(e) => setValues({ ...values, [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                      style={inputStyle}
                    />
                  )}
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <Btn variant="ghost" size="sm" onClick={closeAction}>Cancel</Btn>
                <Btn type="submit">{action.confirmLabel ?? "Confirm"}</Btn>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
