"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import TimetableEditorConsole from "./timetable-editor-console";

export default function TimetableEditorPage() {
  return (
    <PermissionGate required={["timetable.manage"]}>
      <TimetableEditorConsole />
    </PermissionGate>
  );
}
