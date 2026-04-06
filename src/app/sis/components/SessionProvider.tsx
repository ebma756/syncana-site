"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  Permission,
  getPermissionsForRole,
  hasAnyPermission,
  hasPermission,
  roleDefinitions,
} from "@/lib/rbac";
import { clearStoredSession, loadStoredSession, persistSession, SessionUser } from "@/lib/session";

type SessionContextValue = {
  currentUser: SessionUser | null;
  isReady: boolean;
  isAuthenticated: boolean;
  permissions: Permission[] | ["*"];
  roleMeta: typeof roleDefinitions;
  can: (permission: Permission) => boolean;
  canAny: (required: Permission[]) => boolean;
  signIn: (user: SessionUser) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCurrentUser(loadStoredSession());
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const value = useMemo<SessionContextValue>(() => {
    const permissions = currentUser ? getPermissionsForRole(currentUser.role) : [];

    return {
      currentUser,
      isReady,
      isAuthenticated: currentUser !== null,
      permissions,
      roleMeta: roleDefinitions,
      can: (permission) => (currentUser ? hasPermission(currentUser.role, permission) : false),
      canAny: (required) => (currentUser ? hasAnyPermission(currentUser.role, required) : false),
      signIn: (user) => {
        persistSession(user);
        setCurrentUser(user);
      },
      signOut: () => {
        clearStoredSession();
        setCurrentUser(null);
      },
    };
  }, [currentUser, isReady]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside SessionProvider");
  }

  return context;
}
