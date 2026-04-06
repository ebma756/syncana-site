import type { Metadata } from "next";

import { ExpertisePage } from "@/components/pages/SitePages";

export const metadata: Metadata = {
  title: "Our Expertise",
  description:
    "Explore Syncana's managed IT, cybersecurity, Microsoft 365, and backup and recovery services for organisations across Mozambique.",
};

export default function Page() {
  return <ExpertisePage locale="en" />;
}
