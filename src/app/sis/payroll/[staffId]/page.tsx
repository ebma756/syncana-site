import PermissionGate from "@/app/sis/components/PermissionGate";
import PayrollEmployeeConsole from "./payroll-employee-console";

export default async function PayrollEmployeePage({
  params,
}: {
  params: Promise<{ staffId: string }>;
}) {
  const { staffId } = await params;

  return (
    <PermissionGate required={["payroll.manage", "payroll.view"]}>
      <PayrollEmployeeConsole staffId={staffId} />
    </PermissionGate>
  );
}
