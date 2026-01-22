import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, setAccessToken } from "@/lib/api";

type User = { id: number; name: string; role: number } | null;

type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  login: (phone_no: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const isAuthenticated = !!user;

  // 🔁 Run once on page load: try refresh-cookie -> new access token -> fetch /me
  useEffect(() => {
    (async () => {
      try {
        const refreshRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/auth/refresh`,
          { method: "POST", credentials: "include" }
        );

        if (!refreshRes.ok) return;

        const refreshData = await refreshRes.json();
        if (!refreshData?.accessToken) return;

        setAccessToken(refreshData.accessToken);

        const meRes = await apiFetch("/api/auth/me");
        if (!meRes.ok) return;

        const meData = await meRes.json();
        setUser(meData?.user ?? null);
      } finally {
        setIsInitializing(false);
      }
    })();
  }, []);

  async function login(phone_no: string, password: string) {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5173"}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ phone_no, password }),
        }
      );

      if (!res.ok) return false;

      const data = await res.json();
      setAccessToken(data?.accessToken ?? null);
      setUser(data?.user ?? null);

      return !!data?.accessToken && !!data?.user;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({ user, isAuthenticated, isLoading, isInitializing, login, logout }),
    [user, isAuthenticated, isLoading, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
