"use client";

import { useEffect, useMemo, useState } from "react";
import { loadPayrollEntries, PayrollEntry } from "../payroll-storage";

export default function PayrollReportsConsole() {
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [period, setPeriod] = useState("2026-03");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setEntries(loadPayrollEntries());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const periodEntries = useMemo(() => entries.filter((entry) => entry.period === period), [entries, period]);
  const summary = useMemo(() => {
    const gross = periodEntries.reduce((sum, entry) => sum + entry.grossSalary, 0);
    const bonuses = periodEntries.reduce((sum, entry) => sum + entry.adjustment, 0);
    const manualDeductions = periodEntries.reduce((sum, entry) => sum + entry.manualDeduction, 0);
    const advanceDeductions = periodEntries.reduce((sum, entry) => sum + entry.advanceDeduction, 0);
    const deductions = manualDeductions + advanceDeductions;
    const net = periodEntries.reduce((sum, entry) => sum + entry.netSalary, 0);
    const approved = periodEntries.filter((entry) => entry.status === "approved").length;
    const paid = periodEntries.filter((entry) => entry.status === "paid").length;
    return { gross, bonuses, manualDeductions, advanceDeductions, deductions, net, approved, paid };
  }, [periodEntries]);

  return (
    <section className="sis-workspace sis-employees-page">
      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <p className="sis-panel-subtitle">
            Review monthly salary totals, adjustments, deductions, approvals, and paid counts across the whole staff.
          </p>
          <div className="sis-chip chip-syncing">{period}</div>
        </div>
        <div className="sis-kpi-strip">
        <Kpi label="Gross" value={formatMT(summary.gross)} note="Base salary total" />
        <Kpi label="Bonuses" value={formatMT(summary.bonuses)} note="Total additions" />
        <Kpi
          label="Deductions"
          value={formatMT(summary.deductions)}
          note={`${formatMT(summary.advanceDeductions)} advances + ${formatMT(summary.manualDeductions)} manual`}
        />
        <Kpi label="Net / paid" value={`${formatMT(summary.net)} / ${summary.paid}`} note={`${summary.approved} approved`} />
        </div>
      </section>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Monthly salary report</h2>
            <p className="sis-panel-subtitle">Per-employee payroll status for the selected salary month.</p>
          </div>
        </div>

        <div className="sis-filter-bar">
          <label className="sis-field">
            <span className="sis-field-label">Salary month</span>
            <input className="sis-input" type="month" value={period} onChange={(event) => setPeriod(event.target.value)} />
          </label>
        </div>

        <div className="sis-table-wrap">
          <table className="sis-table sis-table-light">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Gross</th>
                <th>Bonus</th>
                <th>Manual deduction</th>
                <th>Advance deduction</th>
                <th>Total deduction</th>
                <th>Net</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {periodEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <div className="sis-table-primary">{entry.employeeName}</div>
                    <div className="sis-table-secondary">
                      {entry.employeeCode} · {entry.department}
                    </div>
                  </td>
                  <td>{formatMT(entry.grossSalary)}</td>
                  <td>{formatMT(entry.adjustment)}</td>
                  <td>{formatMT(entry.manualDeduction)}</td>
                  <td>{formatMT(entry.advanceDeduction)}</td>
                  <td>{formatMT(entry.deduction)}</td>
                  <td>{formatMT(entry.netSalary)}</td>
                  <td>
                    <span className={`sis-chip ${reportChip(entry.status)}`}>{entry.status}</span>
                  </td>
                </tr>
              ))}
              {periodEntries.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="sis-empty-state">No payroll entries for this salary month yet.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="sis-kpi">
      <div className="sis-kpi-label">{label}</div>
      <div className="sis-kpi-value">{value}</div>
      <div className="sis-kpi-note">{note}</div>
    </article>
  );
}

function formatMT(amount: number) {
  return `${amount.toLocaleString()} MT`;
}

function reportChip(status: PayrollEntry["status"]) {
  if (status === "paid") {
    return "chip-up";
  }

  if (status === "approved") {
    return "chip-syncing";
  }

  return "chip-pending";
}
