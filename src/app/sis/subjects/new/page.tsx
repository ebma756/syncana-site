"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import SubjectAssignmentForm from "../subject-form";

export default function AssignSubjectsPage() {
  return (
    <PermissionGate required={["subjects.manage", "teachers.assign"]}>
      <SubjectAssignmentForm />
    </PermissionGate>
  );
}
