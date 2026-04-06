"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadPayrollEntries, PayrollEntry } from "../payroll-storage";

export default function PayrollSlipsConsole() {
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [period, setPeriod] = useState("2026-03");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setEntries(loadPayrollEntries());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const paidEntries = useMemo(
    () =>
      entries
        .filter((entry) => entry.status === "paid")
        .filter((entry) => (period ? entry.period === period : true))
        .sort((a, b) => a.employeeName.localeCompare(b.employeeName)),
    [entries, period],
  );

  return (
    <section className="sis-workspace sis-employees-page">
      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <p className="sis-panel-subtitle">
            Review employee salary slips that have already been paid, including method, paid date, and net salary.
          </p>
          <div className="sis-chip chip-up">{paidEntries.length} paid slips</div>
        </div>
      </section>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Paid slips</h2>
            <p className="sis-panel-subtitle">Each entry reflects an individual employee salary payout.</p>
          </div>
        </div>

        <div className="sis-filter-bar">
          <label className="sis-field">
            <span className="sis-field-label">Salary month</span>
            <input className="sis-input" type="month" value={period} onChange={(event) => setPeriod(event.target.value)} />
          </label>
        </div>

        {paidEntries.length > 0 ? (
          <div className="sis-slip-grid">
            {paidEntries.map((entry) => (
              <article className="sis-slip-card" key={entry.id}>
                <div className="sis-slip-header">
                  <div>
                    <div className="sis-data-heading">{entry.employeeName}</div>
                    <div className="sis-data-meta">
                      {entry.employeeCode} · {entry.period}
                    </div>
                  </div>
                  <span className="sis-chip chip-up">Paid</span>
                </div>
                <div className="sis-data-list">
                  <article className="sis-data-item">
                    <div>
                      <div className="sis-data-heading">Department</div>
                    </div>
                    <div className="sis-data-side">{entry.department}</div>
                  </article>
                  <article className="sis-data-item">
                    <div>
                      <div className="sis-data-heading">Gross salary</div>
                    </div>
                    <div className="sis-data-side">{formatMT(entry.grossSalary)}</div>
                  </article>
                  <article className="sis-data-item">
                    <div>
                      <div className="sis-data-heading">Bonus</div>
                    </div>
                    <div className="sis-data-side">{formatMT(entry.adjustment)}</div>
                  </article>
                  <article className="sis-data-item">
                    <div>
                      <div className="sis-data-heading">Advance deduction</div>
                    </div>
                    <div className="sis-data-side">{formatMT(entry.advanceDeduction)}</div>
                  </article>
                  <article className="sis-data-item">
                    <div>
                      <div className="sis-data-heading">Manual deduction</div>
                    </div>
                    <div className="sis-data-side">{formatMT(entry.manualDeduction)}</div>
                  </article>
                  <article className="sis-data-item">
                    <div>
                      <div className="sis-data-heading">Net paid</div>
                    </div>
                    <div className="sis-data-side">{formatMT(entry.netSalary)}</div>
                  </article>
                  <article className="sis-data-item">
                    <div>
                      <div className="sis-data-heading">Payment method</div>
                    </div>
                    <div className="sis-data-side">{entry.paymentMethod ?? "--"}</div>
                  </article>
                  <article className="sis-data-item">
                    <div>
                      <div className="sis-data-heading">Paid date</div>
                    </div>
                    <div className="sis-data-side">{entry.paidDate ?? "--"}</div>
                  </article>
                </div>
                <div className="sis-row-actions">
                  <Link className="sis-table-action-button" href={`/sis/payroll/slips/${entry.id}`}>
                    Open slip
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="sis-empty-state">No paid slips found for this month yet.</div>
        )}
      </section>
    </section>
  );
}

function formatMT(amount: number) {
  return `${amount.toLocaleString()} MT`;
}
