import { mockStore, type MockStore } from "@/app/sis/mock-data";
import PermissionGate from "@/app/sis/components/PermissionGate";

async function getData(): Promise<MockStore> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/sis/store`, { cache: "no-store" });
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return mockStore;
  }
}

export default async function StorePage() {
  const data = await getData();
  return (
    <PermissionGate required={["store.sales.record", "store.inventory.manage"]}>
      <section className="sis-workspace">
      <div className="sis-workspace-intro">
        <div className="sis-workspace-copy">
          <h1 className="sis-workspace-title">Store and inventory</h1>
          <p className="sis-workspace-text">
            Track POS activity, payment mix, inventory levels, and stock risk from the same operations surface.
          </p>
        </div>
        <div className="sis-chip chip-up">${data.todaySales} today</div>
      </div>

      <section className="sis-subpanel">
        <h2 className="sis-subpanel-title">Today&apos;s summary</h2>
        <p className="sis-muted">
          Payment mix — Cash: ${data.paymentMix.cash}, POS: ${data.paymentMix.pos}, Bank: ${data.paymentMix.bank}
        </p>
      </section>

      <section className="sis-panel">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Inventory</h2>
            <p className="sis-panel-subtitle">Low-stock awareness for the secretary/admin and owner.</p>
          </div>
        </div>
        <div className="sis-table-wrap">
          <table className="sis-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Low</th>
            </tr>
          </thead>
          <tbody>
            {data.products.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td>{p.stock}</td>
                <td>${p.price}</td>
                <td>{p.low ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </section>
      </section>
    </PermissionGate>
  );
}
