"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import CalendarConsole from "./calendar-console";

export default function CalendarPage() {
  return (
    <PermissionGate required={["calendar.manage", "assessments.manage", "communication.calendar.view"]}>
      <CalendarConsole />
    </PermissionGate>
  );
}
