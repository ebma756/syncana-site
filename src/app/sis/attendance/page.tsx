"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import AttendanceConsole from "./attendance-console";

export default function AttendancePage() {
  return (
    <PermissionGate required={["attendance.mark.school", "attendance.mark.assigned", "attendance.view.school"]}>
      <AttendanceConsole />
    </PermissionGate>
  );
}
