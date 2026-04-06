import type { Metadata } from "next";

import { BlogPage } from "@/components/pages/SitePages";

export const metadata: Metadata = {
  title: "Tech Talk",
  description:
    "Read Syncana's practical articles on managed services, Microsoft 365, cybersecurity, and recovery planning for growing businesses.",
};

export default function Page() {
  return <BlogPage locale="en" />;
}
