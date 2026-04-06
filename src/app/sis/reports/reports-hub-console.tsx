"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildCashFlowRows,
  buildFeeCollectionRows,
  buildStudentReportRows,
  formatMt,
  loadReportsSnapshot,
  loadSavedCustomReports,
  SavedCustomReport,
  type ReportsSnapshot,
} from "./report-storage";

const reportCards = [
  {
    href: "/sis/reports/students",
    title: "Student Reports",
    copy: "Filter by grade, class, age, status, and package, then switch to guardian-info views.",
    badge: "ST",
  },
  {
    href: "/sis/reports/fees",
    title: "Fee Collection",
    copy: "Track paid, partial, unpaid, and overdue invoices with month, class, and charge filters.",
    badge: "FC",
  },
  {
    href: "/sis/reports/cash-flow",
    title: "Cash Flow",
    copy: "Review fee inflows, payroll outflows, and operational movement by period.",
    badge: "CF",
  },
  {
    href: "/sis/reports/profit-loss",
    title: "P&L",
    copy: "See operating income versus payroll cost for the selected period.",
    badge: "PL",
  },
  {
    href: "/sis/reports/accounts",
    title: "Accounts",
    copy: "Review payment-method mix, bank setup, balances, and finance totals.",
    badge: "AC",
  },
  {
    href: "/sis/reports/custom",
    title: "Customised Reports",
    copy: "Save filtered table views and reopen them later from one place.",
    badge: "CR",
  },
];

export default function ReportsHubConsole() {
  const [snapshot, setSnapshot] = useState<ReportsSnapshot | null>(null);
  const [savedReports, setSavedReports] = useState<SavedCustomReport[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSnapshot(loadReportsSnapshot());
      setSavedReports(loadSavedCustomReports());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const metrics = useMemo(() => {
    if (!snapshot) {
      return {
        studentRows: 0,
        overdueFees: 0,
        cashFlowRows: 0,
      };
    }

    return {
      studentRows: buildStudentReportRows(snapshot).length,
      overdueFees: buildFeeCollectionRows(snapshot).filter((row) => row.status === "overdue").length,
      cashFlowRows: buildCashFlowRows(snapshot).length,
    };
  }, [snapshot]);

  return (
    <section className="sis-workspace">
      <section className="sis-panel sis-panel-light">
        <div className="sis-page-metrics sis-page-metrics-compact sis-report-hub-metrics">
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Report types</span>
            <span className="sis-page-metric-value">{reportCards.length}</span>
            <span className="sis-page-metric-note">Operational reporting surfaces</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Student rows</span>
            <span className="sis-page-metric-value">{metrics.studentRows}</span>
            <span className="sis-page-metric-note">Available for student drill-down</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Overdue fees</span>
            <span className="sis-page-metric-value">{metrics.overdueFees}</span>
            <span className="sis-page-metric-note">Collections follow-up required</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Saved custom</span>
            <span className="sis-page-metric-value">{savedReports.length}</span>
            <span className="sis-page-metric-note">Reusable filtered views</span>
          </article>
        </div>
      </section>

      <div className="sis-report-hub-grid">
        {reportCards.map((card) => (
          <Link className="sis-report-hub-card" href={card.href} key={card.href}>
            <div className="sis-report-hub-badge">{card.badge}</div>
            <div>
              <div className="sis-report-hub-title">{card.title}</div>
              <div className="sis-report-hub-copy">{card.copy}</div>
            </div>
            <div className="sis-report-hub-link">Open report</div>
          </Link>
        ))}
      </div>

      <div className="sis-report-hub-lower">
        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Saved custom reports</h2>
              <p className="sis-panel-subtitle">Open your saved filtered views without rebuilding the report each time.</p>
            </div>
            <Link className="sis-table-action-button" href="/sis/reports/custom">
              Manage custom reports
            </Link>
          </div>

          {savedReports.length === 0 ? (
            <div className="sis-empty-state">No customised reports saved yet. Build one from the Customised Reports page.</div>
          ) : (
            <div className="sis-data-list sis-data-list-dense">
              {savedReports.map((report) => (
                <article className="sis-data-item sis-data-item-compact" key={report.id}>
                  <div>
                    <div className="sis-data-heading">{report.name}</div>
                    <div className="sis-data-meta">
                      {report.dataset.replace(/_/g, " ")} · Last updated {new Date(report.updatedAt).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                  <Link className="sis-table-action-button sis-table-action-button-muted" href={`/sis/reports/custom?reportId=${report.id}`}>
                    Open saved view
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Finance snapshot</h2>
              <p className="sis-panel-subtitle">Quick totals from the live finance data already stored in the SIS.</p>
            </div>
          </div>
          <div className="sis-data-list sis-data-list-dense">
            <article className="sis-data-item sis-data-item-compact">
              <div>
                <div className="sis-data-heading">Collected fees</div>
                <div className="sis-data-meta">Paid and partial invoice value recorded so far</div>
              </div>
              <div className="sis-data-side">
                {snapshot
                  ? formatMt(buildFeeCollectionRows(snapshot).reduce((sum, row) => sum + row.amountPaid, 0))
                  : "--"}
              </div>
            </article>
            <article className="sis-data-item sis-data-item-compact">
              <div>
                <div className="sis-data-heading">Payroll paid out</div>
                <div className="sis-data-meta">Net salary already paid from payroll records</div>
              </div>
              <div className="sis-data-side">
                {snapshot
                  ? formatMt(snapshot.payrollEntries.filter((entry) => entry.status === "paid").reduce((sum, entry) => sum + entry.netSalary, 0))
                  : "--"}
              </div>
            </article>
            <article className="sis-data-item sis-data-item-compact">
              <div>
                <div className="sis-data-heading">Operational cash rows</div>
                <div className="sis-data-meta">Transactions available inside cash-flow reporting</div>
              </div>
              <div className="sis-data-side">{metrics.cashFlowRows}</div>
            </article>
          </div>
        </section>
      </div>
    </section>
  );
}
