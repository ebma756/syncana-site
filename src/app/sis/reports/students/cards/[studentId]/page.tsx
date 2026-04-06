import PermissionGate from "@/app/sis/components/PermissionGate";
import StudentReportCardDetail from "./student-report-card-detail";

export default async function StudentReportCardPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <PermissionGate required={["reports.cards.view", "reports.cards.generate", "subjects.manage", "students.enroll"]}>
      <StudentReportCardDetail studentId={studentId} />
    </PermissionGate>
  );
}
