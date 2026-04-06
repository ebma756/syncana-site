"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import ClassesConsole from "./classes-console";

export default function ClassesPage() {
  return (
    <PermissionGate required={["subjects.manage", "teachers.assign"]}>
      <ClassesConsole />
    </PermissionGate>
  );
}
