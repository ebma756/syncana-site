"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { roleDefinitions } from "@/lib/rbac";
import { superAdminAccount } from "@/lib/session";
import { useSession } from "@/app/sis/components/SessionProvider";
import { loadStaffMembers, permissionsSummary, seedStaff } from "@/app/sis/employees/employee-storage";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/sis";
  const { currentUser, isReady, signIn } = useSession();
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState(seedStaff);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setProfiles(loadStaffMembers());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (isReady && currentUser) {
      router.replace(nextPath);
    }
  }, [currentUser, isReady, nextPath, router]);

  const filteredProfiles = useMemo(() => {
    const term = query.trim().toLowerCase();
    const staffMatches = profiles.filter((member) => {
      return (
        member.name.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term) ||
        member.employeeCode.toLowerCase().includes(term) ||
        roleDefinitions[member.role].label.toLowerCase().includes(term)
      );
    });

    if (!term) {
      return staffMatches;
    }

    return staffMatches;
  }, [profiles, query]);

  if (!isReady) {
    return <div className="sis-login-shell">Loading profiles…</div>;
  }

  return (
    <main className="sis-login-shell">
      <section className="sis-login-panel">
        <div className="sis-login-copy">
          <p className="sis-eyebrow">SchoolSIS Access</p>
          <h1 className="sis-login-title">Sign in with the staff profile that owns your permissions.</h1>
          <p className="sis-login-text">
            Super admin keeps full access to every module. Every employee profile below inherits only the permissions
            assigned to its category.
          </p>
        </div>

        <div className="sis-login-toolbar">
          <input
            className="sis-login-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, code, email, or role"
          />
        </div>

        <section className="sis-login-grid">
          <button
            type="button"
            className="sis-login-card sis-login-card-super"
            onClick={() => {
              signIn(superAdminAccount);
              router.push(nextPath);
            }}
          >
            <div className="sis-login-badge">Super Admin</div>
            <div className="sis-login-card-title">{superAdminAccount.name}</div>
            <div className="sis-login-card-meta">{superAdminAccount.email}</div>
            <div className="sis-login-card-meta">Full access across all modules</div>
            <div className="sis-login-card-code">{superAdminAccount.employeeCode}</div>
          </button>

          {filteredProfiles.map((member) => (
            <button
              type="button"
              className="sis-login-card"
              key={member.id}
              onClick={() => {
                signIn({
                  id: member.id,
                  name: member.name,
                  email: member.email,
                  role: member.role,
                  employeeCode: member.employeeCode,
                });
                router.push(nextPath);
              }}
            >
              <div className="sis-login-badge">{roleDefinitions[member.role].label}</div>
              <div className="sis-login-card-title">{member.name}</div>
              <div className="sis-login-card-meta">{member.email}</div>
              <div className="sis-login-card-meta">{permissionsSummary(member.role)}</div>
              <div className="sis-login-card-code">{member.employeeCode}</div>
            </button>
          ))}
        </section>
      </section>
    </main>
  );
}
