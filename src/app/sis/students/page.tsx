"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import StudentsConsole from "./students-console";

export default function StudentsPage() {
  return (
    <PermissionGate required={["students.view", "students.enroll"]}>
      <StudentsConsole />
    </PermissionGate>
  );
}
