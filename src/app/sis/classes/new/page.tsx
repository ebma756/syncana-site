"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import ClassForm from "../class-form";

export default function NewClassPage() {
  return (
    <PermissionGate required={["subjects.manage", "teachers.assign"]}>
      <ClassForm />
    </PermissionGate>
  );
}
