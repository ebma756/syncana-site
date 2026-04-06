"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import PayrollApprovalsConsole from "./payroll-approvals-console";

export default function PayrollApprovalsPage() {
  return (
    <PermissionGate required={["payroll.manage", "payroll.view"]}>
      <PayrollApprovalsConsole />
    </PermissionGate>
  );
}
