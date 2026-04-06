"use client";

import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { defaultInstituteProfileSettings, loadInstituteProfileSettings } from "../settings/settings-storage";
import { useSession } from "./SessionProvider";

export default function AuthenticatedSISShell({
  sidebar,
  topbar,
  children,
}: {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isReady } = useSession();
  const [profile, setProfile] = useState(defaultInstituteProfileSettings);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!currentUser) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [currentUser, isReady, pathname, router]);

  useEffect(() => {
    const syncProfile = () => setProfile(loadInstituteProfileSettings());

    syncProfile();
    window.addEventListener("sis:settings-updated", syncProfile);
    return () => window.removeEventListener("sis:settings-updated", syncProfile);
  }, []);

  if (!isReady || !currentUser) {
    return (
      <div className="sis-shell sis-shell-loading">
        <div className="sis-auth-loading">Loading SchoolSIS workspace…</div>
      </div>
    );
  }

  return (
    <div className="sis-shell">
      <aside className="sis-nav-pane">
        <div className="sis-brand-block">
          <div className="sis-brand-row">
            {profile.logoDataUrl ? (
              <Image
                className="sis-brand-logo"
                src={profile.logoDataUrl}
                alt={`${profile.instituteName} logo`}
                width={44}
                height={44}
                unoptimized
              />
            ) : (
              <div className="sis-brand-mark" aria-hidden="true">
                {brandInitials(profile.instituteName)}
              </div>
            )}
            <div className="sis-brand-meta">
              <div className="sis-brand-title">{profile.instituteName}</div>
              <div className="sis-brand-sub">{profile.tagline || "SchoolSIS workspace"}</div>
              <div className="sis-brand-app">Powered by SchoolSIS</div>
            </div>
          </div>
        </div>
        {sidebar}
      </aside>
      <div className="sis-main">
        {topbar}
        {children}
      </div>
    </div>
  );
}

function brandInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
