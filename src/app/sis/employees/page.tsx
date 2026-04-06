"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import EmployeesConsole from "./employees-console";

export default function EmployeesPage() {
  return (
    <PermissionGate required={["staff.manage"]}>
      <EmployeesConsole />
    </PermissionGate>
  );
}
