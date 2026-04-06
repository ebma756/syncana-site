"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import FeeSettingsConsole from "./fees-settings-console";

export default function SettingsFeesPage() {
  return (
    <PermissionGate required={["settings.manage"]}>
      <FeeSettingsConsole />
    </PermissionGate>
  );
}
