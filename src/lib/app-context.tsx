import { createContext, useContext, useState, ReactNode } from "react";
import type { Profile } from "./mock-data";

type View = string;

interface AppCtx {
  profile: Profile | null;
  setProfile: (p: Profile | null) => void;
  view: View;
  setView: (v: View) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [view, setView] = useState<View>("dashboard");

  const setProfile = (p: Profile | null) => {
    setProfileState(p);
    // reset to default view for that profile
    if (p === "Dealer") setView("home");
    else if (p === "Industrial Customer") setView("sites");
    else if (p === "Industrial Account Manager") setView("customers");
    else setView("dashboard");
  };

  return <Ctx.Provider value={{ profile, setProfile, view, setView }}>{children}</Ctx.Provider>;
}

export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("AppProvider missing");
  return c;
};
