import type { Metadata } from "next";

import { AboutPage } from "@/components/pages/SitePages";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn how Syncana Technologies helps businesses in Mozambique simplify technology operations with integrated support, cloud, and security services.",
};

export default function Page() {
  return <AboutPage locale="en" />;
}
