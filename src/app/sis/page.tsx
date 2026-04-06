import DashboardOverview from "./components/DashboardOverview";
import PermissionGate from "./components/PermissionGate";
import { mockDashboard } from "./mock-data";

export default function SISHome() {
  return (
    <PermissionGate required={["dashboard.view"]}>
      <DashboardOverview data={mockDashboard} />
    </PermissionGate>
  );
}
