import PermissionGate from "@/app/sis/components/PermissionGate";
import CashFlowConsole from "../cash-flow-console";

export default function CashFlowReportsPage() {
  return (
    <PermissionGate required={["cashflow.view", "payroll.view"]}>
      <CashFlowConsole />
    </PermissionGate>
  );
}
