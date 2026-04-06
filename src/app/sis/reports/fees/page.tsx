import PermissionGate from "@/app/sis/components/PermissionGate";
import FeeCollectionConsole from "../fee-collection-console";

export default function FeeCollectionReportsPage() {
  return (
    <PermissionGate required={["fees.reports.view", "fees.balances.view"]}>
      <FeeCollectionConsole />
    </PermissionGate>
  );
}
