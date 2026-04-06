"use client";

import { useEffect, useMemo, useState } from "react";
import { downloadCsvFile, printCurrentPage } from "./report-client-utils";
import {
  buildFeeCollectionRows,
  formatMt,
  loadReportsSnapshot,
  monthlyOptionsFromRows,
  ReportsSnapshot,
  toCsvString,
  yearOptionsFromRows,
} from "./report-storage";

export default function FeeCollectionConsole() {
  const [snapshot, setSnapshot] = useState<ReportsSnapshot | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("All months");
  const [selectedYear, setSelectedYear] = useState("All years");
  const [selectedStatus, setSelectedStatus] = useState("All states");
  const [selectedGrade, setSelectedGrade] = useState("All grades");
  const [selectedClass, setSelectedClass] = useState("All classes");
  const [selectedCharge, setSelectedCharge] = useState("All charges");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSnapshot(loadReportsSnapshot());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const rows = useMemo(() => (snapshot ? buildFeeCollectionRows(snapshot) : []), [snapshot]);
  const monthOptions = useMemo(() => ["All months", ...monthlyOptionsFromRows(rows)], [rows]);
  const yearOptions = useMemo(() => ["All years", ...yearOptionsFromRows(rows)], [rows]);
  const gradeOptions = useMemo(() => ["All grades", ...Array.from(new Set(rows.map((row) => row.grade))).sort()], [rows]);
  const classOptions = useMemo(() => {
    const pool = selectedGrade === "All grades" ? rows : rows.filter((row) => row.grade === selectedGrade);
    return ["All classes", ...Array.from(new Set(pool.map((row) => row.className))).sort()];
  }, [rows, selectedGrade]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (selectedMonth !== "All months" && `${row.periodYear}-${row.periodMonth}` !== selectedMonth) return false;
        if (selectedYear !== "All years" && row.periodYear !== selectedYear) return false;
        if (selectedStatus !== "All states" && row.status !== selectedStatus) return false;
        if (selectedGrade !== "All grades" && row.grade !== selectedGrade) return false;
        if (selectedClass !== "All classes" && row.className !== selectedClass) return false;
        if (selectedCharge !== "All charges" && row.chargeType !== selectedCharge) return false;
        return true;
      }),
    [rows, selectedMonth, selectedYear, selectedStatus, selectedGrade, selectedClass, selectedCharge],
  );

  const exportRows = useMemo(
    () =>
      filteredRows.map((row) => ({
        Student: row.studentName,
        Grade: row.grade,
        Class: row.className,
        Charge: row.chargeType,
        Total: row.amount,
        Collected: row.amountPaid,
        Outstanding: row.balance,
        State: row.status,
        Method: row.paymentMethod,
        Due: row.dueDate,
      })),
    [filteredRows],
  );

  return (
    <section className="sis-workspace">
      <section className="sis-panel sis-panel-light">
        <div className="sis-page-metrics sis-page-metrics-compact">
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Invoices</span>
            <span className="sis-page-metric-value">{filteredRows.length}</span>
            <span className="sis-page-metric-note">Rows in the current collection view</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Collected</span>
            <span className="sis-page-metric-value">{formatMt(filteredRows.reduce((sum, row) => sum + row.amountPaid, 0))}</span>
            <span className="sis-page-metric-note">Recorded fee payments</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Outstanding</span>
            <span className="sis-page-metric-value">{formatMt(filteredRows.reduce((sum, row) => sum + row.balance, 0))}</span>
            <span className="sis-page-metric-note">Still to be collected</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Overdue</span>
            <span className="sis-page-metric-value">{filteredRows.filter((row) => row.status === "overdue").length}</span>
            <span className="sis-page-metric-note">Immediate follow-up required</span>
          </article>
        </div>

        <div className="sis-report-toolbar">
          <div className="sis-report-filter-bar sis-report-filter-bar-finance">
            <label className="sis-field">
              <span className="sis-field-label">Month</span>
              <select className="sis-input sis-select" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
                {monthOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "All months" ? option : option}
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
              <span className="sis-field-label">State</span>
              <select className="sis-input sis-select" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                {["All states", "paid", "partial", "due", "overdue"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="sis-field">
              <span className="sis-field-label">Grade</span>
              <select className="sis-input sis-select" value={selectedGrade} onChange={(event) => {
                setSelectedGrade(event.target.value);
                setSelectedClass("All classes");
              }}>
                {gradeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="sis-field">
              <span className="sis-field-label">Class</span>
              <select className="sis-input sis-select" value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>
                {classOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="sis-field">
              <span className="sis-field-label">Charge type</span>
              <select className="sis-input sis-select" value={selectedCharge} onChange={(event) => setSelectedCharge(event.target.value)}>
                {["All charges", "Tuition", "Registration", "Exam", "Transport"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="sis-row-actions">
            <button className="sis-table-action-button sis-table-action-button-muted" type="button" onClick={() => downloadCsvFile("fee-collection-report.csv", toCsvString(exportRows, Object.keys(exportRows[0] ?? { Student: "" })))}>
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
            <h2 className="sis-panel-title">Fee collection results</h2>
            <p className="sis-panel-subtitle">Filter fee collection by period, payment state, class, and charge type.</p>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="sis-empty-state">No fee collection rows match the current filters.</div>
        ) : (
          <div className="sis-table-wrap">
            <table className="sis-table sis-table-light">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Charge</th>
                  <th>Total</th>
                  <th>Collected</th>
                  <th>Outstanding</th>
                  <th>State</th>
                  <th>Method</th>
                  <th>Due date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="sis-table-primary">{row.studentName}</div>
                      <div className="sis-table-secondary">{row.studentCode}</div>
                    </td>
                    <td>{row.grade} {row.className}</td>
                    <td>{row.chargeType}</td>
                    <td>{formatMt(row.amount)}</td>
                    <td>{formatMt(row.amountPaid)}</td>
                    <td>{formatMt(row.balance)}</td>
                    <td><span className={`sis-chip ${feeStatusChip(row.status)}`}>{row.status}</span></td>
                    <td>{row.paymentMethod}</td>
                    <td>{row.dueDate}</td>
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

function feeStatusChip(status: string) {
  if (status === "paid") return "chip-up";
  if (status === "partial") return "chip-syncing";
  return "chip-pending";
}
