import PermissionGate from "@/app/sis/components/PermissionGate";
import StudentReportsConsole from "../student-reports-console";

export default function StudentReportsPage() {
  return (
    <PermissionGate required={["students.view", "students.enroll", "subjects.manage", "reports.cards.generate"]}>
      <StudentReportsConsole />
    </PermissionGate>
  );
}
