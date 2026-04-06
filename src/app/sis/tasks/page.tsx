"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import TasksApprovalsConsole from "./tasks-approvals-console";

export default function TasksPage() {
  return (
    <PermissionGate required={["dashboard.view"]}>
      <TasksApprovalsConsole />
    </PermissionGate>
  );
}
