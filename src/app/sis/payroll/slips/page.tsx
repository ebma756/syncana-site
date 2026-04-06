"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import PayrollSlipsConsole from "./slips-console";

export default function PayrollSlipsPage() {
  return (
    <PermissionGate required={["payroll.view", "payroll.manage"]}>
      <PayrollSlipsConsole />
    </PermissionGate>
  );
}
