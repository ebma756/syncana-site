"use client";

import PermissionGate from "@/app/sis/components/PermissionGate";
import SettingsBanksConsole from "./banks-console";

export default function SettingsBanksPage() {
  return (
    <PermissionGate required={["settings.manage"]}>
      <SettingsBanksConsole />
    </PermissionGate>
  );
}
