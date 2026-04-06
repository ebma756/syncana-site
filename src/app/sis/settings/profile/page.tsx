"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import SettingsProfileConsole from "./profile-console";

export default function SettingsProfilePage() {
  return (
    <PermissionGate required={["settings.manage"]}>
      <SettingsProfileConsole />
    </PermissionGate>
  );
}
