import PermissionGate from "@/app/sis/components/PermissionGate";
import ProfitLossConsole from "../profit-loss-console";

export default function ProfitLossReportsPage() {
  return (
    <PermissionGate required={["cashflow.view", "payroll.view"]}>
      <ProfitLossConsole />
    </PermissionGate>
  );
}
