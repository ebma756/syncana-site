"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SyncStatusType = "up_to_date" | "pending" | "syncing" | "error";

type SyncState = {
  status: SyncStatusType;
  pendingCount: number;
  lastSync?: string;
  errorMessage?: string;
};

const SyncContext = createContext<SyncState | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SyncState>({
    status: "pending",
    pendingCount: 3,
    lastSync: undefined,
  });

  // Simulate a simple sync loop for demo purposes.
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timers.push(
      setTimeout(() => setState((s) => ({ ...s, status: "syncing", pendingCount: 2 })), 1200),
    );
    timers.push(
      setTimeout(
        () =>
          setState({
            status: "up_to_date",
            pendingCount: 0,
            lastSync: new Date().toISOString(),
          }),
        2600,
      ),
    );
    // Periodically queue some items again to show the state changing.
    timers.push(
      setInterval(() => {
        setState({ status: "pending", pendingCount: 2, lastSync: new Date().toISOString() });
        setTimeout(
          () =>
            setState({
              status: "up_to_date",
              pendingCount: 0,
              lastSync: new Date().toISOString(),
            }),
          1500,
        );
      }, 15000),
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const value = useMemo(() => state, [state]);

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync must be used within SyncProvider");
  return ctx;
}
