import PermissionGate from "@/app/sis/components/PermissionGate";
import CustomReportsConsole from "../custom-reports-console";

export default function CustomReportsPage() {
  return (
    <PermissionGate required={["students.view", "students.enroll", "fees.reports.view", "cashflow.view", "payroll.view", "reports.cards.generate"]}>
      <CustomReportsConsole />
    </PermissionGate>
  );
}
