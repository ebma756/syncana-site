"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import GradesConsole from "./grades-console";

export default function GradesPage() {
  return (
    <PermissionGate required={["grades.enter.assigned", "grades.review", "reports.cards.view"]}>
      <GradesConsole />
    </PermissionGate>
  );
}
