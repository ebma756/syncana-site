"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { downloadCsvFile, printCurrentPage } from "./report-client-utils";
import { buildStudentReportRows, loadReportsSnapshot, ReportsSnapshot, StudentReportRow, toCsvString } from "./report-storage";

type StudentViewMode = "students" | "guardians" | "extended";

export default function StudentReportsConsole() {
  const [snapshot, setSnapshot] = useState<ReportsSnapshot | null>(null);
  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All grades");
  const [selectedClass, setSelectedClass] = useState("All classes");
  const [selectedStatus, setSelectedStatus] = useState("All statuses");
  const [selectedAgeBand, setSelectedAgeBand] = useState("All ages");
  const [selectedPackage, setSelectedPackage] = useState("All packages");
  const [viewMode, setViewMode] = useState<StudentViewMode>("students");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSnapshot(loadReportsSnapshot());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const rows = useMemo(() => (snapshot ? buildStudentReportRows(snapshot) : []), [snapshot]);

  const gradeOptions = useMemo(
    () => ["All grades", ...Array.from(new Set(rows.map((row) => row.grade))).sort()],
    [rows],
  );

  const classOptions = useMemo(() => {
    const pool = selectedGrade === "All grades" ? rows : rows.filter((row) => row.grade === selectedGrade);
    return ["All classes", ...Array.from(new Set(pool.map((row) => row.className))).sort()];
  }, [rows, selectedGrade]);

  const packageOptions = useMemo(
    () => ["All packages", ...Array.from(new Set(rows.map((row) => row.packageName))).sort()],
    [rows],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      if (selectedGrade !== "All grades" && row.grade !== selectedGrade) return false;
      if (selectedClass !== "All classes" && row.className !== selectedClass) return false;
      if (selectedStatus !== "All statuses" && row.status !== selectedStatus) return false;
      if (selectedAgeBand !== "All ages" && row.ageBand !== selectedAgeBand) return false;
      if (selectedPackage !== "All packages" && row.packageName !== selectedPackage) return false;
      if (!query) return true;

      return [
        row.studentCode,
        row.fullName,
        row.displayClass,
        row.status,
        row.guardianName,
        row.guardianPhone,
        row.guardianEmail,
        row.packageName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [rows, search, selectedGrade, selectedClass, selectedStatus, selectedAgeBand, selectedPackage]);

  const visibleColumns = useMemo(() => {
    if (viewMode === "guardians") {
      return [
        { key: "studentCode", label: "ID" },
        { key: "fullName", label: "Student name" },
        { key: "displayClass", label: "Class" },
        { key: "guardianName", label: "Guardian / father" },
        { key: "guardianRelationship", label: "Relationship" },
        { key: "guardianPhone", label: "Mobile" },
        { key: "guardianEmail", label: "Email" },
      ] as const;
    }

    if (viewMode === "extended") {
      return [
        { key: "studentCode", label: "ID" },
        { key: "fullName", label: "Student name" },
        { key: "displayClass", label: "Class" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "status", label: "Status" },
        { key: "packageName", label: "Package" },
        { key: "guardianName", label: "Guardian" },
      ] as const;
    }

    return [
      { key: "studentCode", label: "ID" },
      { key: "fullName", label: "Student name" },
      { key: "displayClass", label: "Class" },
      { key: "age", label: "Age" },
      { key: "gender", label: "Gender" },
      { key: "status", label: "Status" },
      { key: "packageName", label: "Package" },
    ] as const;
  }, [viewMode]);

  const exportRows = useMemo(
    () =>
      filteredRows.map((row) =>
        Object.fromEntries(
          visibleColumns.map((column) => [column.label, `${row[column.key as keyof StudentReportRow] ?? ""}`]),
        ) as Record<string, string>,
      ),
    [filteredRows, visibleColumns],
  );

  return (
    <section className="sis-workspace">
      <section className="sis-panel sis-panel-light">
        <div className="sis-page-metrics sis-page-metrics-compact">
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Visible students</span>
            <span className="sis-page-metric-value">{filteredRows.length}</span>
            <span className="sis-page-metric-note">Rows after current filters</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Active learners</span>
            <span className="sis-page-metric-value">{filteredRows.filter((row) => row.status === "Active").length}</span>
            <span className="sis-page-metric-note">Current active enrollments</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">With package</span>
            <span className="sis-page-metric-value">{filteredRows.filter((row) => row.packageName !== "No package").length}</span>
            <span className="sis-page-metric-note">Extracurricular add-on enrolled</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Guardian view</span>
            <span className="sis-page-metric-value">{viewMode === "guardians" ? "On" : "Off"}</span>
            <span className="sis-page-metric-note">Column set ready for parent/father info exports</span>
          </article>
        </div>

        <div className="sis-report-toolbar">
          <div className="sis-report-filter-bar sis-report-filter-bar-students">
            <label className="sis-field">
              <span className="sis-field-label">Search</span>
              <input
                className="sis-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Student, code, guardian, package"
              />
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
              <span className="sis-field-label">Status</span>
              <select className="sis-input sis-select" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                {["All statuses", "Active", "Transferred", "Withdrawn", "Archived"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="sis-field">
              <span className="sis-field-label">Age band</span>
              <select className="sis-input sis-select" value={selectedAgeBand} onChange={(event) => setSelectedAgeBand(event.target.value)}>
                {["All ages", "5 and under", "6-7", "8-10", "11+"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="sis-field">
              <span className="sis-field-label">Package</span>
              <select className="sis-input sis-select" value={selectedPackage} onChange={(event) => setSelectedPackage(event.target.value)}>
                {packageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="sis-report-actions-row">
            <div className="sis-report-view-switch">
              {[
                { key: "students", label: "Student list" },
                { key: "guardians", label: "Guardian / father info" },
                { key: "extended", label: "Extended info" },
              ].map((option) => (
                <button
                  key={option.key}
                  className={`sis-report-view-button${viewMode === option.key ? " sis-report-view-button-active" : ""}`}
                  type="button"
                  onClick={() => setViewMode(option.key as StudentViewMode)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="sis-row-actions">
              <button
                className="sis-table-action-button sis-table-action-button-muted"
                type="button"
                onClick={() => downloadCsvFile("student-report.csv", toCsvString(exportRows, visibleColumns.map((column) => column.label)))}
              >
                CSV
              </button>
              <button className="sis-table-action-button sis-table-action-button-muted" type="button" onClick={printCurrentPage}>
                Print / PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Student report results</h2>
            <p className="sis-panel-subtitle">Drill down by enrollment, guardian contact, or extended student profile information.</p>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="sis-empty-state">No students match the current report filters.</div>
        ) : (
          <div className="sis-table-wrap">
            <table className="sis-table sis-table-light">
              <thead>
                <tr>
                  {visibleColumns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                  <th>Report card</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>
                        {column.key === "status" ? (
                          <span className={`sis-chip ${studentStatusChip(row.status)}`}>{row.status}</span>
                        ) : (
                          row[column.key as keyof StudentReportRow]
                        )}
                      </td>
                    ))}
                    <td>
                      <Link className="sis-table-action-button sis-table-action-button-muted" href={`/sis/reports/students/cards/${row.studentId}`}>
                        Open card
                      </Link>
                    </td>
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

function studentStatusChip(status: string) {
  if (status === "Active") return "chip-up";
  if (status === "Archived") return "chip-syncing";
  return "chip-pending";
}
