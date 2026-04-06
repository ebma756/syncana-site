import { mockOperationsHub } from "@/app/sis/mock-data";
import PermissionGate from "@/app/sis/components/PermissionGate";

export default function OperationsPage() {
  const data = mockOperationsHub;

  return (
    <PermissionGate required={["students.enroll", "fees.invoices.create", "expenses.create"]}>
      <section className="sis-workspace">
        <section className="sis-panel sis-panel-light sis-operations-summary-panel">
          <div className="sis-operations-summary-grid">
            <SummaryItem label="New enrollments" value={`${data.summary.newEnrollments}`} note="This week" />
            <SummaryItem label="Invoices due" value={`${data.summary.invoicesDue}`} note="Reminder batch ready" />
            <SummaryItem label="Daily cash" value={data.summary.dailyCash} note="Cash + POS + bank" />
            <SummaryItem label="Parent messages" value={`${data.summary.parentMessages}`} note="Need responses" />
          </div>
        </section>

        <div className="sis-operations-grid">
          <section className="sis-panel sis-panel-light sis-operations-main-panel">
            <div className="sis-panel-header">
              <div>
                <h2 className="sis-panel-title">Enrollment pipeline</h2>
                <p className="sis-panel-subtitle">Students who still need front-office follow-up or document closure.</p>
              </div>
            </div>
            <div className="sis-data-list sis-data-list-dense">
              {data.enrollments.map((entry) => (
                <article className="sis-data-item sis-data-item-compact" key={entry.student}>
                  <div>
                    <div className="sis-data-heading">{entry.student}</div>
                    <div className="sis-data-meta">{entry.grade}</div>
                  </div>
                  <div className="sis-data-side">{entry.status}</div>
                </article>
              ))}
            </div>
          </section>

          <section className="sis-panel sis-panel-light sis-operations-side-panel">
            <div className="sis-panel-header">
              <div>
                <h2 className="sis-panel-title">Role focus areas</h2>
                <p className="sis-panel-subtitle">What the front office should keep moving today.</p>
              </div>
              <div className="sis-chip chip-pending">Operations queue open</div>
            </div>
            <ul className="sis-plain-list sis-plain-list-dense">
              {data.actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Finance and daily operations</h2>
              <p className="sis-panel-subtitle">Front-office cash, invoice, and reconciliation work that still needs attention.</p>
            </div>
          </div>
          <div className="sis-data-list sis-data-list-dense">
            {data.financeOps.map((item) => (
              <article className="sis-data-item sis-data-item-compact" key={item.item}>
                <div>
                  <div className="sis-data-heading">{item.item}</div>
                  <div className="sis-data-meta">{item.detail}</div>
                </div>
                <div className="sis-data-side sis-operations-queue-value">{item.value}</div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </PermissionGate>
  );
}

function SummaryItem({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="sis-operations-summary-item">
      <div className="sis-kpi-label">{label}</div>
      <div className="sis-operations-summary-value">{value}</div>
      <div className="sis-kpi-note">{note}</div>
    </article>
  );
}
