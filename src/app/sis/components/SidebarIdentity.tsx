"use client";

import { useRouter } from "next/navigation";
import { useSession } from "./SessionProvider";

export default function SidebarIdentity() {
  const router = useRouter();
  const { currentUser, roleMeta, signOut } = useSession();

  if (!currentUser) {
    return null;
  }

  const currentRole = roleMeta[currentUser.role];

  return (
    <div className="sis-sidebar-footer">
      <div className="sis-user-avatar">{currentRole.shortLabel}</div>
      <div>
        <div className="sis-footer-name">{currentUser.name}</div>
        <div className="sis-brand-sub">{currentRole.subtitle}</div>
        <button
          type="button"
          className="sis-sidebar-logout"
          onClick={() => {
            signOut();
            router.push("/login");
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
