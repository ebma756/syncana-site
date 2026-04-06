import PermissionGate from "@/app/sis/components/PermissionGate";
import PayrollSlipDetail from "./slip-detail";

export default async function PayrollSlipDetailPage({
  params,
}: {
  params: Promise<{ slipId: string }>;
}) {
  const { slipId } = await params;

  return (
    <PermissionGate required={["payroll.view", "payroll.manage"]}>
      <PayrollSlipDetail slipId={slipId} />
    </PermissionGate>
  );
}
