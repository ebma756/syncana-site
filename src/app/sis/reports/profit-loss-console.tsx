"use client";

import { useEffect, useMemo, useState } from "react";
import { printCurrentPage } from "./report-client-utils";
import { buildCashFlowRows, formatMt, loadReportsSnapshot, monthlyOptionsFromRows, ReportsSnapshot, yearOptionsFromRows } from "./report-storage";

export default function ProfitLossConsole() {
  const [snapshot, setSnapshot] = useState<ReportsSnapshot | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("All months");
  const [selectedYear, setSelectedYear] = useState("All years");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSnapshot(loadReportsSnapshot());
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const rows = useMemo(() => (snapshot ? buildCashFlowRows(snapshot) : []), [snapshot]);
  const monthOptions = useMemo(() => ["All months", ...monthlyOptionsFromRows(rows)], [rows]);
  const yearOptions = useMemo(() => ["All years", ...yearOptionsFromRows(rows)], [rows]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (selectedMonth !== "All months" && `${row.periodYear}-${row.periodMonth}` !== selectedMonth) return false;
        if (selectedYear !== "All years" && row.periodYear !== selectedYear) return false;
        return true;
      }),
    [rows, selectedMonth, selectedYear],
  );

  const summary = useMemo(() => {
    const feeIncome = filteredRows.filter((row) => row.direction === "Inflow" && row.category === "Fees").reduce((sum, row) => sum + row.amount, 0);
    const storeIncome = filteredRows.filter((row) => row.direction === "Inflow" && row.category === "Store").reduce((sum, row) => sum + row.amount, 0);
    const payrollCost = filteredRows.filter((row) => row.direction === "Outflow" && row.category === "Payroll").reduce((sum, row) => sum + row.amount, 0);
    const totalIncome = feeIncome + storeIncome;
    return {
      feeIncome,
      storeIncome,
      payrollCost,
      totalIncome,
      result: totalIncome - payrollCost,
    };
  }, [filteredRows]);

  return (
    <section className="sis-workspace">
      <section className="sis-panel sis-panel-light">
        <div className="sis-page-metrics sis-page-metrics-compact">
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Fee income</span>
            <span className="sis-page-metric-value">{formatMt(summary.feeIncome)}</span>
            <span className="sis-page-metric-note">Collected from student fee payments</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Store income</span>
            <span className="sis-page-metric-value">{formatMt(summary.storeIncome)}</span>
            <span className="sis-page-metric-note">Operational store sales included in the period</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Payroll cost</span>
            <span className="sis-page-metric-value">{formatMt(summary.payrollCost)}</span>
            <span className="sis-page-metric-note">Net salary already paid</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Operating result</span>
            <span className="sis-page-metric-value">{formatMt(summary.result)}</span>
            <span className="sis-page-metric-note">Income minus payroll cost</span>
          </article>
        </div>

        <div className="sis-report-toolbar">
          <div className="sis-report-filter-bar sis-report-filter-bar-compact">
            <label className="sis-field">
              <span className="sis-field-label">Month</span>
              <select className="sis-input sis-select" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
                {monthOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="sis-field">
              <span className="sis-field-label">Year</span>
              <select className="sis-input sis-select" value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
                {yearOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="sis-row-actions">
            <button className="sis-table-action-button sis-table-action-button-muted" type="button" onClick={printCurrentPage}>
              Print / PDF
            </button>
          </div>
        </div>
      </section>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Operational P&amp;L summary</h2>
            <p className="sis-panel-subtitle">A school operations view of income and payroll cost for the selected period.</p>
          </div>
        </div>
        <div className="sis-data-list sis-data-list-dense">
          <article className="sis-data-item sis-data-item-compact">
            <div>
              <div className="sis-data-heading">Fee income</div>
              <div className="sis-data-meta">Paid and partial fee collections</div>
            </div>
            <div className="sis-data-side">{formatMt(summary.feeIncome)}</div>
          </article>
          <article className="sis-data-item sis-data-item-compact">
            <div>
              <div className="sis-data-heading">Store income</div>
              <div className="sis-data-meta">Optional operating sales currently available in the SIS</div>
            </div>
            <div className="sis-data-side">{formatMt(summary.storeIncome)}</div>
          </article>
          <article className="sis-data-item sis-data-item-compact">
            <div>
              <div className="sis-data-heading">Payroll cost</div>
              <div className="sis-data-meta">Net salary already paid out</div>
            </div>
            <div className="sis-data-side">{formatMt(summary.payrollCost)}</div>
          </article>
          <article className="sis-data-item sis-data-item-compact">
            <div>
              <div className="sis-data-heading">Operating result</div>
              <div className="sis-data-meta">Current income less payroll cost</div>
            </div>
            <div className="sis-data-side">{formatMt(summary.result)}</div>
          </article>
        </div>
      </section>
    </section>
  );
}
