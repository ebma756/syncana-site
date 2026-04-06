"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import SettingsGradingConsole from "./grading-console";

export default function SettingsGradingPage() {
  return (
    <PermissionGate required={["settings.manage"]}>
      <SettingsGradingConsole />
    </PermissionGate>
  );
}
