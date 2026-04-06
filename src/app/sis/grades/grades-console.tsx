"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { useSession } from "../components/SessionProvider";
import { loadStudents, seedStudents } from "../students/student-storage";
import { loadManagedClasses, managedClassOptions, managedGradeOptions } from "../classes/class-storage";
import {
  AcademicTerm,
  buildGradeEntriesForClass,
  classGradeEntries,
  GradeDraft,
  loadGradeEntries,
  ManagedGradeEntry,
  ModerationStatus,
  persistGradeEntries,
  replaceGradeEntriesForSelection,
  subjectOptions,
  AssessmentSubject,
  termOptions,
} from "./grades-storage";
import { loadGradingSettings } from "../settings/settings-storage";
import { subjectOptionsForClass } from "../subjects/subject-storage";

export default function GradesConsole() {
  const { can } = useSession();
  const [gradeEntries, setGradeEntries] = useState<ManagedGradeEntry[]>([]);
  const [activeStudents, setActiveStudents] = useState(() => seedStudents.filter((student) => student.status === "Active"));
  const [managedClasses, setManagedClasses] = useState(() => loadManagedClasses());
  const [grade, setGrade] = useState("Grade 1");
  const [className, setClassName] = useState("A");
  const [subject, setSubject] = useState<AssessmentSubject>(subjectOptions()[0] ?? "Mathematics");
  const [term, setTerm] = useState<AcademicTerm>("T1");
  const [drafts, setDrafts] = useState<Record<string, GradeDraft>>({});
  const [gradingSettings, setGradingSettings] = useState(loadGradingSettings());

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const students = loadStudents().filter((student) => student.status === "Active");
      const firstStudent = students[0];
      const nextClasses = loadManagedClasses();
      const nextSubjectOptions = subjectOptions();
      setActiveStudents(students);
      setManagedClasses(nextClasses);
      if (firstStudent) {
        setGrade(firstStudent.grade);
        setClassName(firstStudent.className);
      } else if (nextClasses[0]) {
        setGrade(nextClasses[0].grade);
        setClassName(nextClasses[0].className);
      }

      setGradeEntries(loadGradeEntries());
      setGradingSettings(loadGradingSettings());
      setSubject(subjectOptionsForClass(nextClasses[0]?.id ?? "")[0] ?? nextSubjectOptions[0] ?? "Mathematics");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const roster = useMemo(
    () => activeStudents.filter((student) => student.grade === grade && student.className === className),
    [activeStudents, className, grade],
  );
  const activeClassId = useMemo(
    () => managedClasses.find((item) => item.grade === grade && item.className === className)?.id ?? "",
    [className, grade, managedClasses],
  );
  const availableGrades = useMemo(() => managedGradeOptions(managedClasses), [managedClasses]);
  const availableClasses = useMemo(() => managedClassOptions(managedClasses, grade), [grade, managedClasses]);
  const availableSubjects = useMemo(
    () => subjectOptionsForClass(activeClassId),
    [activeClassId],
  );

  const existingEntries = useMemo(
    () => classGradeEntries(gradeEntries, grade, className, subject, term),
    [className, grade, gradeEntries, subject, term],
  );

  useEffect(() => {
    const nextDrafts = roster.reduce<Record<string, GradeDraft>>((acc, student) => {
      const existing = existingEntries.find((entry) => entry.studentId === student.id);
      acc[student.id] = {
        studentId: student.id,
        testScore: `${existing?.testScore ?? 0}`,
        firstTryScore: `${existing?.firstTryScore ?? 0}`,
        secondTryScore: existing?.secondTryScore === null || existing?.secondTryScore === undefined ? "" : `${existing.secondTryScore}`,
        notes: existing?.notes ?? "",
      };
      return acc;
    }, {});

    const timeoutId = window.setTimeout(() => {
      setDrafts(nextDrafts);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [existingEntries, roster]);

  const reportEntries = useMemo(
    () =>
      buildGradeEntriesForClass({
        roster,
        subject,
        term,
        drafts: Object.values(drafts),
        moderationStatus: existingEntries[0]?.moderationStatus ?? "draft",
      }),
    [drafts, existingEntries, roster, subject, term],
  );

  const summary = useMemo(() => {
    const passCount = reportEntries.filter((entry) => entry.passStatus === "Pass").length;
    const failCount = reportEntries.filter((entry) => entry.passStatus === "Fail").length;
    const secondTryCount = reportEntries.filter((entry) => entry.usedSecondTry).length;
    const passRate = reportEntries.length > 0 ? Math.round((passCount / reportEntries.length) * 100) : 0;
    return { passCount, failCount, secondTryCount, passRate };
  }, [reportEntries]);

  const moderationStatus = existingEntries[0]?.moderationStatus ?? "draft";

  function updateDraft(studentId: string, next: Partial<GradeDraft>) {
    setDrafts((current) => ({
      ...current,
      [studentId]: {
        ...(current[studentId] ?? {
          studentId,
          testScore: "0",
          firstTryScore: "0",
          secondTryScore: "",
          notes: "",
        }),
        ...next,
      },
    }));
  }

  function saveWithStatus(nextStatus: ModerationStatus) {
    const nextEntries = buildGradeEntriesForClass({
      roster,
      subject,
      term,
      drafts: Object.values(drafts),
      moderationStatus: nextStatus,
    });

    startTransition(() => {
      setGradeEntries((current) => {
        const next = replaceGradeEntriesForSelection({
          currentEntries: current,
          grade,
          className,
          subject,
          term,
          nextEntries,
        });
        persistGradeEntries(next);
        return next;
      });
    });
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <div className="sis-page-header">
        <div className="sis-workspace-copy">
          <h1 className="sis-workspace-title">Grades and exams</h1>
          <p className="sis-workspace-text">
            Manage test marks, First Try exam results, Second Try recovery results, and report-card outputs using the
            current grading setup with pass at {gradingSettings.passMark}.
          </p>
          <div className="sis-page-metrics">
            <article className="sis-page-metric">
              <span className="sis-page-metric-label">Pass rate</span>
              <span className="sis-page-metric-value">{summary.passRate}%</span>
              <span className="sis-page-metric-note">Current final result view</span>
            </article>
            <article className="sis-page-metric">
              <span className="sis-page-metric-label">Pass / fail</span>
              <span className="sis-page-metric-value">
                {summary.passCount} / {summary.failCount}
              </span>
              <span className="sis-page-metric-note">Learners across this selection</span>
            </article>
            <article className="sis-page-metric">
              <span className="sis-page-metric-label">Second Try</span>
              <span className="sis-page-metric-value">{summary.secondTryCount}</span>
              <span className="sis-page-metric-note">Recovery session used</span>
            </article>
            <article className="sis-page-metric">
              <span className="sis-page-metric-label">Scale</span>
              <span className="sis-page-metric-value">
                {gradingSettings.scaleMin}–{gradingSettings.scaleMax}
              </span>
              <span className="sis-page-metric-note">Pass mark {gradingSettings.passMark}</span>
            </article>
          </div>
        </div>
        <div className="sis-page-header-actions">
          <span className={`sis-chip ${moderationChip(moderationStatus)}`}>{moderationStatus}</span>
          <Link href="/sis/settings/grading" className="sis-button sis-button-secondary">
            Grading settings
          </Link>
        </div>
      </div>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Gradebook</h2>
            <p className="sis-panel-subtitle">
              Final score is the average of the test score and exam score, where Second Try replaces First Try when used.
            </p>
          </div>
        </div>

        <div className="sis-form-grid sis-form-grid-balanced">
          <label className="sis-field">
            <span className="sis-field-label">Grade</span>
              <select className="sis-input sis-select" value={grade} onChange={(event) => {
                const nextGrade = event.target.value;
                const nextClasses = managedClassOptions(managedClasses, nextGrade);
                setGrade(nextGrade);
                setClassName(nextClasses.includes(className) ? className : nextClasses[0] ?? className);
                const nextClassId =
                  managedClasses.find(
                    (item) => item.grade === nextGrade && item.className === (nextClasses.includes(className) ? className : nextClasses[0]),
                  )?.id ?? "";
                setSubject(subjectOptionsForClass(nextClassId)[0] ?? subjectOptions()[0] ?? "Mathematics");
              }}>
              {availableGrades.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="sis-field">
            <span className="sis-field-label">Class</span>
            <select className="sis-input sis-select" value={className} onChange={(event) => setClassName(event.target.value)}>
              {availableClasses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="sis-field">
            <span className="sis-field-label">Subject</span>
            <select
              className="sis-input sis-select"
              value={subject}
              onChange={(event) => setSubject(event.target.value as AssessmentSubject)}
            >
              {availableSubjects.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="sis-field">
            <span className="sis-field-label">Term</span>
            <select className="sis-input sis-select" value={term} onChange={(event) => setTerm(event.target.value as AcademicTerm)}>
              {termOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="sis-table-wrap">
          <table className="sis-table sis-table-light">
            <thead>
              <tr>
                <th>Student</th>
                <th>Test</th>
                <th>First Try</th>
                <th>Second Try</th>
                <th>Final</th>
                <th>Band</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((student) => {
                const draft = drafts[student.id] ?? {
                  studentId: student.id,
                  testScore: "0",
                  firstTryScore: "0",
                  secondTryScore: "",
                  notes: "",
                };
                const reportRow =
                  reportEntries.find((entry) => entry.studentId === student.id) ??
                  existingEntries.find((entry) => entry.studentId === student.id);

                return (
                  <tr key={student.id}>
                    <td>
                      <div className="sis-table-primary">{student.fullName}</div>
                      <div className="sis-table-secondary">{student.studentCode}</div>
                    </td>
                    <td>
                      <input
                        className="sis-input sis-compact-input"
                        type="number"
                        min={gradingSettings.scaleMin}
                        max={gradingSettings.scaleMax}
                        value={draft.testScore}
                        onChange={(event) => updateDraft(student.id, { testScore: event.target.value })}
                        disabled={!can("grades.enter.assigned") && !can("grades.review")}
                      />
                    </td>
                    <td>
                      <input
                        className="sis-input sis-compact-input"
                        type="number"
                        min={gradingSettings.scaleMin}
                        max={gradingSettings.scaleMax}
                        value={draft.firstTryScore}
                        onChange={(event) => updateDraft(student.id, { firstTryScore: event.target.value })}
                        disabled={!can("grades.enter.assigned") && !can("grades.review")}
                      />
                    </td>
                    <td>
                      <input
                        className="sis-input sis-compact-input"
                        type="number"
                        min={gradingSettings.scaleMin}
                        max={gradingSettings.scaleMax}
                        value={draft.secondTryScore}
                        onChange={(event) => updateDraft(student.id, { secondTryScore: event.target.value })}
                        placeholder="-"
                        disabled={!can("grades.enter.assigned") && !can("grades.review")}
                      />
                    </td>
                    <td>
                      <div className="sis-table-primary">{reportRow?.finalScore ?? 0}</div>
                      <div className="sis-table-secondary">{reportRow?.usedSecondTry ? "Used Second Try" : "First Try kept"}</div>
                    </td>
                    <td>{reportRow?.bandLabel ?? "F"}</td>
                    <td>
                      <span className={`sis-chip ${reportRow?.passStatus === "Pass" ? "chip-up" : "chip-pending"}`}>
                        {reportRow?.passStatus ?? "Fail"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="sis-form-actions">
          <button
            className="sis-button sis-button-secondary"
            type="button"
            onClick={() => saveWithStatus("draft")}
            disabled={!can("grades.enter.assigned") && !can("grades.review")}
          >
            Save draft
          </button>
          <button
            className="sis-button sis-button-secondary"
            type="button"
            onClick={() => saveWithStatus("submitted")}
            disabled={!can("grades.enter.assigned") && !can("grades.review")}
          >
            Submit final grades
          </button>
          <button
            className="sis-button sis-button-primary"
            type="button"
            onClick={() => saveWithStatus("published")}
            disabled={!can("grades.publish")}
          >
            Publish results
          </button>
        </div>
      </section>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Report card preview</h2>
            <p className="sis-panel-subtitle">
              Shows both exam sessions and flags students whose final result came from Second Try.
            </p>
          </div>
        </div>

        <div className="sis-table-wrap">
          <table className="sis-table sis-table-light">
            <thead>
              <tr>
                <th>Student</th>
                <th>First Try</th>
                <th>Second Try</th>
                <th>Final</th>
                <th>Flag</th>
              </tr>
            </thead>
            <tbody>
              {reportEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.studentName}</td>
                  <td>{entry.firstTryScore}</td>
                  <td>{entry.secondTryScore ?? "-"}</td>
                  <td>
                    {entry.finalScore} · {entry.bandLabel}
                  </td>
                  <td>{entry.usedSecondTry ? "Second Try used" : "First Try only"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Current grading scale</h2>
            <p className="sis-panel-subtitle">Pass mark is {gradingSettings.passMark}, with the following banding active in-app.</p>
          </div>
        </div>

        <div className="sis-scale-list">
          {gradingSettings.bands.map((band) => (
            <article className="sis-scale-item" key={band.label}>
              <div className="sis-data-heading">{band.label}</div>
              <div className="sis-data-meta">
                {band.min}-{band.max}
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function moderationChip(status: ModerationStatus) {
  if (status === "published") {
    return "chip-up";
  }

  if (status === "submitted") {
    return "chip-syncing";
  }

  return "chip-pending";
}
