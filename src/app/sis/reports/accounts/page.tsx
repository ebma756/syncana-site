import PermissionGate from "@/app/sis/components/PermissionGate";
import AccountsReportConsole from "../accounts-report-console";

export default function AccountsReportsPage() {
  return (
    <PermissionGate required={["fees.reports.view", "cashflow.view", "payroll.view"]}>
      <AccountsReportConsole />
    </PermissionGate>
  );
}
