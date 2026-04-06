"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import SubjectsConsole from "./subjects-console";

export default function SubjectsPage() {
  return (
    <PermissionGate required={["subjects.manage", "teachers.assign"]}>
      <SubjectsConsole />
    </PermissionGate>
  );
}
