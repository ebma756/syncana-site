import type { Metadata } from "next";

import { HomePage } from "@/components/pages/SitePages";

export const metadata: Metadata = {
  title: "Managed IT Services",
  description:
    "Syncana Technologies delivers managed IT services, cybersecurity, Microsoft 365 support, and business continuity solutions for growing businesses in Mozambique.",
};

export default function Page() {
  return <HomePage locale="en" />;
}
