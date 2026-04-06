"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import PayrollReportsConsole from "./reports-console";

export default function PayrollReportsPage() {
  return (
    <PermissionGate required={["payroll.view", "payroll.manage"]}>
      <PayrollReportsConsole />
    </PermissionGate>
  );
}
