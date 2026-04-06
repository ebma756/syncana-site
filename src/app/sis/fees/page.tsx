"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import FeesConsole from "./fees-console";

export default function FeesPage() {
  return (
    <PermissionGate required={["fees.balances.view", "fees.invoices.create"]}>
      <FeesConsole />
    </PermissionGate>
  );
}
