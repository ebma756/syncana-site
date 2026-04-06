"use client";

import { useEffect, useMemo, useState } from "react";
import { downloadCsvFile, printCurrentPage } from "./report-client-utils";
import {
  buildCashFlowRows,
  formatMt,
  loadReportsSnapshot,
  monthlyOptionsFromRows,
  ReportsSnapshot,
  toCsvString,
  yearOptionsFromRows,
} from "./report-storage";

export default function CashFlowConsole() {
  const [snapshot, setSnapshot] = useState<ReportsSnapshot | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("All months");
  const [selectedYear, setSelectedYear] = useState("All years");
  const [selectedDirection, setSelectedDirection] = useState("All directions");

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
        if (selectedDirection !== "All directions" && row.direction !== selectedDirection) return false;
        return true;
      }),
    [rows, selectedMonth, selectedYear, selectedDirection],
  );

  const totals = useMemo(() => {
    const inflow = filteredRows.filter((row) => row.direction === "Inflow").reduce((sum, row) => sum + row.amount, 0);
    const outflow = filteredRows.filter((row) => row.direction === "Outflow").reduce((sum, row) => sum + row.amount, 0);
    return { inflow, outflow, net: inflow - outflow };
  }, [filteredRows]);

  const exportRows = useMemo(
    () =>
      filteredRows.map((row) => ({
        Date: row.date,
        Direction: row.direction,
        Category: row.category,
        Reference: row.reference,
        Detail: row.detail,
        Method: row.method,
        Amount: row.amount,
      })),
    [filteredRows],
  );

  return (
    <section className="sis-workspace">
      <section className="sis-panel sis-panel-light">
        <div className="sis-page-metrics sis-page-metrics-compact">
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Inflows</span>
            <span className="sis-page-metric-value">{formatMt(totals.inflow)}</span>
            <span className="sis-page-metric-note">Fee and store intake</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Outflows</span>
            <span className="sis-page-metric-value">{formatMt(totals.outflow)}</span>
            <span className="sis-page-metric-note">Payroll paid out</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Net movement</span>
            <span className="sis-page-metric-value">{formatMt(totals.net)}</span>
            <span className="sis-page-metric-note">Operational cash position for the period</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Transactions</span>
            <span className="sis-page-metric-value">{filteredRows.length}</span>
            <span className="sis-page-metric-note">Rows available in the summary</span>
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
            <label className="sis-field">
              <span className="sis-field-label">Direction</span>
              <select className="sis-input sis-select" value={selectedDirection} onChange={(event) => setSelectedDirection(event.target.value)}>
                {["All directions", "Inflow", "Outflow"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="sis-row-actions">
            <button className="sis-table-action-button sis-table-action-button-muted" type="button" onClick={() => downloadCsvFile("cash-flow-report.csv", toCsvString(exportRows, Object.keys(exportRows[0] ?? { Date: "" })))}>
              CSV
            </button>
            <button className="sis-table-action-button sis-table-action-button-muted" type="button" onClick={printCurrentPage}>
              Print / PDF
            </button>
          </div>
        </div>
      </section>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Cash flow rows</h2>
            <p className="sis-panel-subtitle">Operational movement built from fee collections, payroll payouts, and store activity.</p>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="sis-empty-state">No cash-flow rows match the selected period filters.</div>
        ) : (
          <div className="sis-table-wrap">
            <table className="sis-table sis-table-light">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Direction</th>
                  <th>Category</th>
                  <th>Reference</th>
                  <th>Detail</th>
                  <th>Method</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td><span className={`sis-chip ${row.direction === "Inflow" ? "chip-up" : "chip-pending"}`}>{row.direction}</span></td>
                    <td>{row.category}</td>
                    <td>{row.reference}</td>
                    <td>{row.detail}</td>
                    <td>{row.method}</td>
                    <td>{formatMt(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
