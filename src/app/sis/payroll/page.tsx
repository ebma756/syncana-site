"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import PayrollConsole from "./payroll-console";

export default function PayrollPage() {
  return (
    <PermissionGate required={["payroll.manage", "payroll.view"]}>
      <PayrollConsole />
    </PermissionGate>
  );
}
