"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import ExamSchedulerConsole from "./exam-scheduler-console";

export default function ExamSchedulerPage() {
  return (
    <PermissionGate required={["assessments.manage", "communication.calendar.view"]}>
      <ExamSchedulerConsole />
    </PermissionGate>
  );
}
