"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadInstituteProfileSettings } from "@/app/sis/settings/settings-storage";
import { printCurrentPage } from "../../../report-client-utils";
import { buildStudentReportCard, loadReportsSnapshot, ReportsSnapshot } from "../../../report-storage";

export default function StudentReportCardDetail({ studentId }: { studentId: string }) {
  const [snapshot, setSnapshot] = useState<ReportsSnapshot | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSnapshot(loadReportsSnapshot());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const reportCard = useMemo(() => (snapshot ? buildStudentReportCard(studentId, snapshot) : null), [snapshot, studentId]);
  const profile = useMemo(() => loadInstituteProfileSettings(), []);

  if (!snapshot) {
    return (
      <section className="sis-workspace">
        <section className="sis-panel sis-panel-light">
          <div className="sis-empty-state">Loading student report card...</div>
        </section>
      </section>
    );
  }

  if (!reportCard) {
    return (
      <section className="sis-workspace">
        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Report card not found</h2>
              <p className="sis-panel-subtitle">This student or their grading data could not be found in the current SIS records.</p>
            </div>
          </div>
          <Link className="sis-table-action-button" href="/sis/reports/students">
            Back to student reports
          </Link>
        </section>
      </section>
    );
  }

  return (
    <section className="sis-workspace sis-report-card-page">
      <div className="sis-row-actions sis-print-hide">
        <Link className="sis-table-action-button sis-table-action-button-muted" href="/sis/reports/students">
          Back to student reports
        </Link>
        <button className="sis-table-action-button" type="button" onClick={printCurrentPage}>
          Print / Save PDF
        </button>
      </div>

      <section className="sis-report-card-sheet">
        <header className="sis-report-card-header">
          <div className="sis-report-card-school">{profile.instituteName}</div>
          <div className="sis-report-card-tagline">{profile.tagline}</div>
          <div className="sis-report-card-title">Student Report Card</div>
        </header>

        <div className="sis-report-card-meta-grid">
          <article className="sis-report-card-meta">
            <div className="sis-payslip-label">Student</div>
            <div className="sis-payslip-value">{reportCard.student.fullName}</div>
            <div className="sis-payslip-caption">{reportCard.student.studentCode}</div>
          </article>
          <article className="sis-report-card-meta">
            <div className="sis-payslip-label">Class</div>
            <div className="sis-payslip-value">{reportCard.student.grade} {reportCard.student.className}</div>
            <div className="sis-payslip-caption">Academic year {reportCard.student.academicYear}</div>
          </article>
          <article className="sis-report-card-meta">
            <div className="sis-payslip-label">Guardian</div>
            <div className="sis-payslip-value">{reportCard.student.guardianName}</div>
            <div className="sis-payslip-caption">{reportCard.student.guardianPhone}</div>
          </article>
          <article className="sis-report-card-meta">
            <div className="sis-payslip-label">Package</div>
            <div className="sis-payslip-value">{reportCard.packageName}</div>
            <div className="sis-payslip-caption">Extracurricular enrollment</div>
          </article>
        </div>

        <div className="sis-page-metrics sis-page-metrics-compact">
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Average</span>
            <span className="sis-page-metric-value">{reportCard.average}</span>
            <span className="sis-page-metric-note">Overall final average</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Subjects passed</span>
            <span className="sis-page-metric-value">{reportCard.passCount}</span>
            <span className="sis-page-metric-note">Passed subject results</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Second try used</span>
            <span className="sis-page-metric-value">{reportCard.secondTryCount}</span>
            <span className="sis-page-metric-note">Recovery exam count</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Result rows</span>
            <span className="sis-page-metric-value">{reportCard.entries.length}</span>
            <span className="sis-page-metric-note">Subjects included in this card</span>
          </article>
        </div>

        <div className="sis-table-wrap">
          <table className="sis-table sis-table-light">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Test</th>
                <th>First Try</th>
                <th>Second Try</th>
                <th>Final</th>
                <th>Band</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportCard.entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.subject}</td>
                  <td>{entry.testScore}</td>
                  <td>{entry.firstTryScore}</td>
                  <td>{entry.secondTryScore ?? "--"}</td>
                  <td>{entry.finalScore}</td>
                  <td>{entry.bandLabel}</td>
                  <td><span className={`sis-chip ${entry.passStatus === "Pass" ? "chip-up" : "chip-pending"}`}>{entry.passStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sis-report-card-footer">
          <div>
            <div className="sis-payslip-label">School contact</div>
            <div className="sis-payslip-caption">{profile.phone} · {profile.address}</div>
          </div>
          <div>
            <div className="sis-payslip-label">Generated from SIS</div>
            <div className="sis-payslip-caption">{new Date().toLocaleDateString("en-GB")}</div>
          </div>
        </div>
      </section>
    </section>
  );
}
