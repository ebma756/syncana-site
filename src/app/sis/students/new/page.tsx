"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import StudentForm from "../student-form";

export default function NewStudentPage() {
  return (
    <PermissionGate required={["students.enroll"]}>
      <StudentForm />
    </PermissionGate>
  );
}
