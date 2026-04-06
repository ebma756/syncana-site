import type { Metadata } from "next";
import "../globals.css";
import { ReactNode } from "react";
import AuthenticatedSISShell from "./components/AuthenticatedSISShell";
import SidebarIdentity from "./components/SidebarIdentity";
import { SyncProvider } from "./components/SyncProvider";
import SidebarNav from "./components/SidebarNav";
import TopbarMeta from "./components/TopbarMeta";

export const metadata: Metadata = {
  title: "SIS",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SISLayout({ children }: { children: ReactNode }) {
  return (
    <SyncProvider>
      <AuthenticatedSISShell sidebar={<><SidebarNav /><SidebarIdentity /></>} topbar={<TopbarMeta />}>
        {children}
      </AuthenticatedSISShell>
    </SyncProvider>
  );
}
