"use client";

import { ReactNode } from "react";
import { Permission } from "@/lib/rbac";
import { useSession } from "./SessionProvider";

export default function PermissionGate({
  required,
  children,
}: {
  required: Permission[];
  children: ReactNode;
}) {
  const { canAny, roleMeta, currentUser } = useSession();

  if (!currentUser) {
    return null;
  }

  if (!canAny(required)) {
    return (
      <section className="sis-panel">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Access restricted</h2>
            <p className="sis-panel-subtitle">
              {roleMeta[currentUser.role].label} does not have permission to open this workspace.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
