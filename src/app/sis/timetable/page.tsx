"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import TimetableConsole from "./timetable-console";

export default function TimetablePage() {
  return (
    <PermissionGate required={["timetable.manage", "timetable.view.assigned"]}>
      <TimetableConsole />
    </PermissionGate>
  );
}
