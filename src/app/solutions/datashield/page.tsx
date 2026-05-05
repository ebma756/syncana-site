import type { Metadata } from "next";

import { DataShieldPage } from "@/components/pages/DataShieldPage";

export const metadata: Metadata = {
  title: "DataShield — Data Protection for Professional Services Firms",
  description:
    "For law firms, clinics, and accounting firms handling sensitive client data — Syncana's DataShield helps you protect it, document it, and prove it.",
};

export default function Page() {
  return <DataShieldPage locale="en" />;
}
