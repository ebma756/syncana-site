"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import EmployeeForm from "../employee-form";

export default function NewEmployeePage() {
  return (
    <PermissionGate required={["staff.manage"]}>
      <EmployeeForm />
    </PermissionGate>
  );
}
