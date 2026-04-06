"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import PayrollAdvancesConsole from "./payroll-advances-console";

export default function PayrollAdvancesPage() {
  return (
    <PermissionGate required={["payroll.manage", "payroll.view"]}>
      <PayrollAdvancesConsole />
    </PermissionGate>
  );
}
