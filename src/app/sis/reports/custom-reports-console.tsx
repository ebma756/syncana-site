"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { downloadCsvFile, printCurrentPage } from "./report-client-utils";
import {
  buildCashFlowRows,
  buildFeeCollectionRows,
  buildStudentReportRows,
  customReportDatasetOptions,
  datasetColumnOptions,
  defaultCustomColumns,
  deleteSavedCustomReport,
  findSavedCustomReport,
  loadReportsSnapshot,
  loadSavedCustomReports,
  monthlyOptionsFromRows,
  persistSavedCustomReports,
  ReportDatasetKey,
  ReportsSnapshot,
  SavedCustomReport,
  toCsvString,
  upsertSavedCustomReport,
  yearOptionsFromRows,
} from "./report-storage";

export default function CustomReportsConsole() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");

  const [snapshot, setSnapshot] = useState<ReportsSnapshot | null>(null);
  const [savedReports, setSavedReports] = useState<SavedCustomReport[]>([]);
  const [dataset, setDataset] = useState<ReportDatasetKey>("students");
  const [reportName, setReportName] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    search: "",
    grade: "All grades",
    className: "All classes",
    status: "All statuses",
    ageBand: "All ages",
    packageName: "All packages",
    month: "All months",
    year: "All years",
    chargeType: "All charges",
    direction: "All directions",
  });
  const [selectedColumns, setSelectedColumns] = useState<string[]>(defaultCustomColumns.students);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSnapshot(loadReportsSnapshot());
      setSavedReports(loadSavedCustomReports());
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!reportId) {
      return;
    }

    const match = findSavedCustomReport(savedReports, reportId);
    if (!match) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDataset(match.dataset);
      setReportName(match.name);
      setFilters((current) => ({ ...current, ...match.selectedFilters }));
      setSelectedColumns(match.selectedColumns);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [reportId, savedReports]);

  const studentRows = useMemo(() => (snapshot ? buildStudentReportRows(snapshot) : []), [snapshot]);
  const feeRows = useMemo(() => (snapshot ? buildFeeCollectionRows(snapshot) : []), [snapshot]);
  const cashRows = useMemo(() => (snapshot ? buildCashFlowRows(snapshot) : []), [snapshot]);

  const datasetRows = useMemo(() => {
    if (dataset === "fee_collection") {
      return feeRows.filter((row) => {
        if (filters.month !== "All months" && `${row.periodYear}-${row.periodMonth}` !== filters.month) return false;
        if (filters.year !== "All years" && row.periodYear !== filters.year) return false;
        if (filters.status !== "All statuses" && row.status !== filters.status) return false;
        if (filters.grade !== "All grades" && row.grade !== filters.grade) return false;
        if (filters.className !== "All classes" && row.className !== filters.className) return false;
        if (filters.chargeType !== "All charges" && row.chargeType !== filters.chargeType) return false;
        return true;
      });
    }

    if (dataset === "cash_flow") {
      return cashRows.filter((row) => {
        if (filters.month !== "All months" && `${row.periodYear}-${row.periodMonth}` !== filters.month) return false;
        if (filters.year !== "All years" && row.periodYear !== filters.year) return false;
        if (filters.direction !== "All directions" && row.direction !== filters.direction) return false;
        return true;
      });
    }

    const query = filters.search.trim().toLowerCase();
    return studentRows.filter((row) => {
      if (filters.grade !== "All grades" && row.grade !== filters.grade) return false;
      if (filters.className !== "All classes" && row.className !== filters.className) return false;
      if (filters.status !== "All statuses" && row.status !== filters.status) return false;
      if (filters.ageBand !== "All ages" && row.ageBand !== filters.ageBand) return false;
      if (filters.packageName !== "All packages" && row.packageName !== filters.packageName) return false;
      if (!query) return true;
      return [row.studentCode, row.fullName, row.guardianName, row.packageName].join(" ").toLowerCase().includes(query);
    });
  }, [dataset, feeRows, cashRows, studentRows, filters]);

  const columnOptions = datasetColumnOptions[dataset];
  const previewRows = useMemo(
    () =>
      datasetRows.slice(0, 25).map((row) =>
        Object.fromEntries(selectedColumns.map((column) => [column, `${row[column as keyof typeof row] ?? ""}`])) as Record<string, string>,
      ),
    [datasetRows, selectedColumns],
  );

  const monthOptions = useMemo(() => {
    const source = dataset === "cash_flow" ? cashRows : feeRows;
    return ["All months", ...monthlyOptionsFromRows(source)];
  }, [dataset, cashRows, feeRows]);

  const yearOptions = useMemo(() => {
    const source = dataset === "cash_flow" ? cashRows : feeRows;
    return ["All years", ...yearOptionsFromRows(source)];
  }, [dataset, cashRows, feeRows]);

  const filterBarClassName =
    dataset === "students"
      ? "sis-report-filter-bar sis-report-filter-bar-students"
      : dataset === "fee_collection"
        ? "sis-report-filter-bar sis-report-filter-bar-finance"
        : "sis-report-filter-bar sis-report-filter-bar-compact";

  function saveCurrentReport() {
    const trimmedName = reportName.trim();
    if (!trimmedName) {
      return;
    }

    const nextReport: SavedCustomReport = {
      id: reportId ?? `custom-report-${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: trimmedName,
      dataset,
      selectedFilters: filters,
      selectedColumns,
      updatedAt: new Date().toISOString(),
    };

    const nextReports = upsertSavedCustomReport(savedReports, nextReport);
    setSavedReports(nextReports);
    persistSavedCustomReports(nextReports);
    router.replace(`/sis/reports/custom?reportId=${nextReport.id}`);
  }

  return (
    <section className="sis-workspace">
      <section className="sis-panel sis-panel-light">
        <div className="sis-page-metrics sis-page-metrics-compact">
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Dataset</span>
            <span className="sis-page-metric-value">{customReportDatasetOptions.find((entry) => entry.key === dataset)?.label ?? "Report"}</span>
            <span className="sis-page-metric-note">Source used for the saved filtered view</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Preview rows</span>
            <span className="sis-page-metric-value">{datasetRows.length}</span>
            <span className="sis-page-metric-note">Rows matching the current filters</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Columns</span>
            <span className="sis-page-metric-value">{selectedColumns.length}</span>
            <span className="sis-page-metric-note">Visible fields saved with the report</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Saved reports</span>
            <span className="sis-page-metric-value">{savedReports.length}</span>
            <span className="sis-page-metric-note">Reusable custom views already stored</span>
          </article>
        </div>
        <div className="sis-report-builder-shell">
          <div className="sis-form-grid sis-form-grid-balanced">
            <label className="sis-field">
              <span className="sis-field-label">Report name</span>
              <input className="sis-input" value={reportName} onChange={(event) => setReportName(event.target.value)} placeholder="e.g. Grade 1 unpaid fees" />
            </label>
            <label className="sis-field">
              <span className="sis-field-label">Dataset</span>
              <select
                className="sis-input sis-select"
                value={dataset}
                onChange={(event) => {
                  const nextDataset = event.target.value as ReportDatasetKey;
                  setDataset(nextDataset);
                  setSelectedColumns(defaultCustomColumns[nextDataset]);
                }}
              >
                {customReportDatasetOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={filterBarClassName}>
            {dataset === "students" ? (
              <>
                <label className="sis-field">
                  <span className="sis-field-label">Search</span>
                  <input className="sis-input" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
                </label>
                <label className="sis-field">
                  <span className="sis-field-label">Grade</span>
                  <select className="sis-input sis-select" value={filters.grade} onChange={(event) => setFilters((current) => ({ ...current, grade: event.target.value, className: "All classes" }))}>
                    {["All grades", ...Array.from(new Set(studentRows.map((row) => row.grade))).sort()].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="sis-field">
                  <span className="sis-field-label">Class</span>
                  <select className="sis-input sis-select" value={filters.className} onChange={(event) => setFilters((current) => ({ ...current, className: event.target.value }))}>
                    {["All classes", ...Array.from(new Set(studentRows.filter((row) => filters.grade === "All grades" || row.grade === filters.grade).map((row) => row.className))).sort()].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="sis-field">
                  <span className="sis-field-label">Status</span>
                  <select className="sis-input sis-select" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
                    {["All statuses", "Active", "Transferred", "Withdrawn", "Archived"].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="sis-field">
                  <span className="sis-field-label">Age band</span>
                  <select className="sis-input sis-select" value={filters.ageBand} onChange={(event) => setFilters((current) => ({ ...current, ageBand: event.target.value }))}>
                    {["All ages", "5 and under", "6-7", "8-10", "11+"].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="sis-field">
                  <span className="sis-field-label">Package</span>
                  <select className="sis-input sis-select" value={filters.packageName} onChange={(event) => setFilters((current) => ({ ...current, packageName: event.target.value }))}>
                    {["All packages", ...Array.from(new Set(studentRows.map((row) => row.packageName))).sort()].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <>
                <label className="sis-field">
                  <span className="sis-field-label">Month</span>
                  <select className="sis-input sis-select" value={filters.month} onChange={(event) => setFilters((current) => ({ ...current, month: event.target.value }))}>
                    {monthOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="sis-field">
                  <span className="sis-field-label">Year</span>
                  <select className="sis-input sis-select" value={filters.year} onChange={(event) => setFilters((current) => ({ ...current, year: event.target.value }))}>
                    {yearOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                {dataset === "fee_collection" ? (
                  <>
                    <label className="sis-field">
                      <span className="sis-field-label">State</span>
                      <select className="sis-input sis-select" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
                        {["All statuses", "paid", "partial", "due", "overdue"].map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <label className="sis-field">
                      <span className="sis-field-label">Grade</span>
                      <select className="sis-input sis-select" value={filters.grade} onChange={(event) => setFilters((current) => ({ ...current, grade: event.target.value, className: "All classes" }))}>
                        {["All grades", ...Array.from(new Set(feeRows.map((row) => row.grade))).sort()].map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <label className="sis-field">
                      <span className="sis-field-label">Class</span>
                      <select className="sis-input sis-select" value={filters.className} onChange={(event) => setFilters((current) => ({ ...current, className: event.target.value }))}>
                        {["All classes", ...Array.from(new Set(feeRows.filter((row) => filters.grade === "All grades" || row.grade === filters.grade).map((row) => row.className))).sort()].map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <label className="sis-field">
                      <span className="sis-field-label">Charge type</span>
                      <select className="sis-input sis-select" value={filters.chargeType} onChange={(event) => setFilters((current) => ({ ...current, chargeType: event.target.value }))}>
                        {["All charges", "Tuition", "Registration", "Exam", "Transport"].map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : (
                  <label className="sis-field">
                    <span className="sis-field-label">Direction</span>
                    <select className="sis-input sis-select" value={filters.direction} onChange={(event) => setFilters((current) => ({ ...current, direction: event.target.value }))}>
                      {["All directions", "Inflow", "Outflow"].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            )}
          </div>

          <section className="sis-report-builder-block">
            <div className="sis-report-builder-header">
              <div>
                <h2 className="sis-panel-title">Visible columns</h2>
                <p className="sis-panel-subtitle">Choose which fields stay in the saved report and preview table.</p>
              </div>
              <div className="sis-report-actions-note">{selectedColumns.length} columns selected</div>
            </div>

            <div className="sis-report-columns">
              {columnOptions.map((column) => {
                const active = selectedColumns.includes(column.key);
                return (
                  <button
                    key={column.key}
                    className={`sis-report-column-toggle${active ? " sis-report-column-toggle-active" : ""}`}
                    type="button"
                    onClick={() =>
                      setSelectedColumns((current) =>
                        active
                          ? current.length > 1
                            ? current.filter((entry) => entry !== column.key)
                            : current
                          : [...current, column.key],
                      )
                    }
                  >
                    {column.label}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="sis-report-actions-row">
            <div className="sis-report-actions-note">Save this setup to reopen the same filtered view later.</div>
            <div className="sis-row-actions">
              <button className="sis-table-action-button sis-table-action-button-muted" type="button" onClick={() => downloadCsvFile("custom-report-preview.csv", toCsvString(previewRows, selectedColumns))}>
                CSV
              </button>
              <button className="sis-table-action-button sis-table-action-button-muted" type="button" onClick={printCurrentPage}>
                Print / PDF
              </button>
              <button className="sis-table-action-button" type="button" onClick={saveCurrentReport}>
                Save report
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="sis-report-hub-lower">
        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Preview</h2>
              <p className="sis-panel-subtitle">A live preview of the saved filtered table view.</p>
            </div>
          </div>
          {previewRows.length === 0 ? (
            <div className="sis-empty-state">No rows match the current custom report setup.</div>
          ) : (
            <div className="sis-table-wrap">
              <table className="sis-table sis-table-light">
                <thead>
                  <tr>
                    {selectedColumns.map((column) => (
                      <th key={column}>{columnOptions.find((entry) => entry.key === column)?.label ?? column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, index) => (
                    <tr key={`${row[selectedColumns[0]!] ?? "row"}-${index}`}>
                      {selectedColumns.map((column) => (
                        <td key={column}>{row[column]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Saved reports</h2>
              <p className="sis-panel-subtitle">Open, reuse, or remove saved custom views.</p>
            </div>
          </div>
          {savedReports.length === 0 ? (
            <div className="sis-empty-state">No customised reports saved yet.</div>
          ) : (
            <div className="sis-data-list sis-data-list-dense">
              {savedReports.map((report) => (
                <article className="sis-data-item sis-data-item-compact" key={report.id}>
                  <div>
                    <div className="sis-data-heading">{report.name}</div>
                    <div className="sis-data-meta">{report.dataset.replace(/_/g, " ")} · {report.selectedColumns.length} columns</div>
                  </div>
                  <div className="sis-row-actions">
                    <button className="sis-table-action-button sis-table-action-button-muted" type="button" onClick={() => router.replace(`/sis/reports/custom?reportId=${report.id}`)}>
                      Open
                    </button>
                    <button
                      className="sis-table-action-button sis-table-action-button-warning"
                      type="button"
                      onClick={() => {
                        const nextReports = deleteSavedCustomReport(savedReports, report.id);
                        setSavedReports(nextReports);
                        persistSavedCustomReports(nextReports);
                        if (reportId === report.id) {
                          router.replace("/sis/reports/custom");
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
