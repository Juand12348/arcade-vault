"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type User = { name: string };

type Session = {
  user: User | null;
  login: (u: User | null) => void;
  signOut: () => void;
};

const KEY = "av_user";
const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  // Empieza en null (igual que el servidor) y se rellena tras hidratar.
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- leer localStorage solo es posible en cliente
      if (saved) setUser(saved);
    } catch {
      // JSON corrupto o localStorage no disponible: sin sesión.
    }
  }, []);

  const login = (u: User | null) => {
    setUser(u);
    try {
      if (u) localStorage.setItem(KEY, JSON.stringify(u));
      else localStorage.removeItem(KEY);
    } catch {
      // modo privado: la sesión dura lo que dure la pestaña.
    }
  };

  const signOut = () => login(null);

  return <SessionContext.Provider value={{ user, login, signOut }}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}
