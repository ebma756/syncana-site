import type { Metadata } from "next";

import { ContactPage } from "@/components/pages/SitePages";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Syncana Technologies to request an IT audit, discuss support needs, or explore cybersecurity and Microsoft 365 services.",
};

export default function Page() {
  return <ContactPage locale="en" />;
}
