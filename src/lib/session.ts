"use client";

import { AppRole } from "@/lib/rbac";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  employeeCode?: string;
};

export const SESSION_STORAGE_KEY = "sis-session-user";

export const superAdminAccount: SessionUser = {
  id: "usr-superadmin-001",
  name: "School Owner",
  email: "owner@schoolsis.local",
  role: "super_admin",
  employeeCode: "ADM-001",
};

export function loadStoredSession(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as SessionUser;
  } catch {
    return null;
  }
}

export function persistSession(user: SessionUser) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}
