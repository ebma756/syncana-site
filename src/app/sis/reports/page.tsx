import PermissionGate from "@/app/sis/components/PermissionGate";
import ReportsHubConsole from "./reports-hub-console";

export default function ReportsPage() {
  return (
    <PermissionGate required={["students.view", "students.enroll", "subjects.manage", "fees.reports.view", "cashflow.view", "payroll.view", "reports.cards.view", "reports.cards.generate"]}>
      <ReportsHubConsole />
    </PermissionGate>
  );
}
