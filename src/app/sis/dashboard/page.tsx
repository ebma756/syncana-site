import DashboardOverview from "@/app/sis/components/DashboardOverview";
import PermissionGate from "@/app/sis/components/PermissionGate";
import { mockDashboard } from "@/app/sis/mock-data";

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/sis/dashboard`, { cache: "no-store" });
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return mockDashboard;
  }
}

export default async function DashboardPage() {
  const data = await getData();
  return (
    <PermissionGate required={["dashboard.view"]}>
      <DashboardOverview data={data} />
    </PermissionGate>
  );
}
