"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useSession } from "../components/SessionProvider";
import { loadStudents } from "../students/student-storage";
import { loadManagedClasses, managedClassOptions, managedGradeOptions } from "../classes/class-storage";
import {
  attendanceForClassDate,
  AttendanceDraft,
  AttendanceEntry,
  AttendanceStatus,
  buildDailyAttendanceEntries,
  defaultAttendanceDate,
  latestAbsenceAlerts,
  loadAttendanceEntries,
  persistAttendanceEntries,
  replaceAttendanceForClassDate,
} from "./attendance-storage";

export default function AttendanceConsole() {
  const { can } = useSession();
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>([]);
  const [activeStudents, setActiveStudents] = useState(() => loadStudents().filter((student) => student.status === "Active"));
  const [managedClasses, setManagedClasses] = useState(() => loadManagedClasses());
  const [grade, setGrade] = useState("Grade 1");
  const [className, setClassName] = useState("A");
  const [date, setDate] = useState(defaultAttendanceDate);
  const [drafts, setDrafts] = useState<Record<string, AttendanceDraft>>({});

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const students = loadStudents().filter((student) => student.status === "Active");
      const entries = loadAttendanceEntries();
      const nextClasses = loadManagedClasses();

      setActiveStudents(students);
      setManagedClasses(nextClasses);
      const firstStudent = students[0];
      if (firstStudent) {
        setGrade(firstStudent.grade);
        setClassName(firstStudent.className);
      } else if (nextClasses[0]) {
        setGrade(nextClasses[0].grade);
        setClassName(nextClasses[0].className);
      }

      setAttendanceEntries(entries);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const roster = useMemo(
    () => activeStudents.filter((student) => student.grade === grade && student.className === className),
    [activeStudents, className, grade],
  );
  const availableGrades = useMemo(() => managedGradeOptions(managedClasses), [managedClasses]);
  const availableClasses = useMemo(() => managedClassOptions(managedClasses, grade), [grade, managedClasses]);

  const existingDailyEntries = useMemo(
    () => attendanceForClassDate(attendanceEntries, grade, className, date),
    [attendanceEntries, className, date, grade],
  );

  useEffect(() => {
    const nextDrafts = roster.reduce<Record<string, AttendanceDraft>>((acc, student) => {
      const existing = existingDailyEntries.find((entry) => entry.studentId === student.id);
      acc[student.id] = {
        studentId: student.id,
        status: existing?.status ?? "present",
        note: existing?.note ?? "",
      };
      return acc;
    }, {});

    const timeoutId = window.setTimeout(() => {
      setDrafts(nextDrafts);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [existingDailyEntries, roster]);

  const recentAlerts = useMemo(() => latestAbsenceAlerts(attendanceEntries), [attendanceEntries]);
  const summary = useMemo(() => {
    const dayEntries = Object.values(drafts);
    const present = dayEntries.filter((entry) => entry.status === "present").length;
    const late = dayEntries.filter((entry) => entry.status === "late").length;
    const absent = dayEntries.filter((entry) => entry.status === "absent").length;
    const excused = dayEntries.filter((entry) => entry.status === "excused").length;
    return { present, late, absent, excused };
  }, [drafts]);

  function updateDraft(studentId: string, next: Partial<AttendanceDraft>) {
    setDrafts((current) => ({
      ...current,
      [studentId]: {
        ...(current[studentId] ?? { studentId, status: "present", note: "" }),
        ...next,
      },
    }));
  }

  function bulkSetStatus(status: AttendanceStatus) {
    setDrafts((current) =>
      Object.fromEntries(
        Object.entries(current).map(([studentId, draft]) => [studentId, { ...draft, status } satisfies AttendanceDraft]),
      ),
    );
  }

  function saveAttendance() {
    const nextDailyEntries = buildDailyAttendanceEntries({
      grade,
      className,
      date,
      drafts: Object.values(drafts),
    });

    startTransition(() => {
      setAttendanceEntries((current) => {
        const next = replaceAttendanceForClassDate({
          currentEntries: current,
          grade,
          className,
          date,
          nextDailyEntries,
        });
        persistAttendanceEntries(next);
        return next;
      });
    });
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <div className="sis-page-header">
        <div className="sis-workspace-copy">
          <h1 className="sis-workspace-title">Attendance control</h1>
          <p className="sis-workspace-text">
            Mark daily attendance by class, review repeat absences, and prepare follow-up for guardians using the real
            enrolled student roster.
          </p>
          <div className="sis-page-metrics">
            <article className="sis-page-metric">
              <span className="sis-page-metric-label">Roster</span>
              <span className="sis-page-metric-value">{roster.length}</span>
              <span className="sis-page-metric-note">
                {grade} {className}
              </span>
            </article>
            <article className="sis-page-metric">
              <span className="sis-page-metric-label">Present</span>
              <span className="sis-page-metric-value">{summary.present}</span>
              <span className="sis-page-metric-note">Marked on this register</span>
            </article>
            <article className="sis-page-metric">
              <span className="sis-page-metric-label">Late / absent</span>
              <span className="sis-page-metric-value">{summary.late + summary.absent}</span>
              <span className="sis-page-metric-note">Need follow-up</span>
            </article>
            <article className="sis-page-metric">
              <span className="sis-page-metric-label">Saved records</span>
              <span className="sis-page-metric-value">{existingDailyEntries.length}</span>
              <span className="sis-page-metric-note">Already stored for this day</span>
            </article>
          </div>
        </div>
        <div className="sis-page-header-actions">
          <span className="sis-chip chip-syncing">
            {grade} {className}
          </span>
        </div>
      </div>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Daily register</h2>
            <p className="sis-panel-subtitle">Choose the class and date, then save the full day in one action.</p>
          </div>
        </div>

        <div className="sis-form-grid sis-form-grid-balanced">
          <label className="sis-field">
            <span className="sis-field-label">Grade</span>
            <select
              className="sis-input sis-select"
              value={grade}
              onChange={(event) => {
                const nextGrade = event.target.value;
                const nextClasses = managedClassOptions(managedClasses, nextGrade);
                setGrade(nextGrade);
                setClassName(nextClasses.includes(className) ? className : nextClasses[0] ?? className);
              }}
              disabled={!can("attendance.mark.school") && !can("attendance.mark.assigned")}
            >
              {availableGrades.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="sis-field">
            <span className="sis-field-label">Class</span>
            <select
              className="sis-input sis-select"
              value={className}
              onChange={(event) => setClassName(event.target.value)}
              disabled={!can("attendance.mark.school") && !can("attendance.mark.assigned")}
            >
              {availableClasses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="sis-field">
            <span className="sis-field-label">Date</span>
            <input
              className="sis-input"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              disabled={!can("attendance.mark.school") && !can("attendance.mark.assigned")}
            />
          </label>
        </div>

        <div className="sis-row-actions sis-row-actions-wrap">
          <button type="button" className="sis-button sis-button-secondary" onClick={() => bulkSetStatus("present")}>
            All present
          </button>
          <button type="button" className="sis-button sis-button-secondary" onClick={() => bulkSetStatus("late")}>
            All late
          </button>
          <button type="button" className="sis-button sis-button-secondary" onClick={() => bulkSetStatus("absent")}>
            All absent
          </button>
          <button type="button" className="sis-button sis-button-primary" onClick={saveAttendance}>
            Save register
          </button>
        </div>

        <div className="sis-table-wrap">
          <table className="sis-table sis-table-light">
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((student) => {
                const draft = drafts[student.id] ?? {
                  studentId: student.id,
                  status: "present" as AttendanceStatus,
                  note: "",
                };

                return (
                  <tr key={student.id}>
                    <td>
                      <div className="sis-table-primary">{student.fullName}</div>
                      <div className="sis-table-secondary">{student.studentCode}</div>
                    </td>
                    <td>
                      <select
                        className="sis-input sis-select sis-compact-input"
                        value={draft.status}
                        onChange={(event) => updateDraft(student.id, { status: event.target.value as AttendanceStatus })}
                        disabled={!can("attendance.mark.school") && !can("attendance.mark.assigned")}
                      >
                        <option value="present">Present</option>
                        <option value="late">Late</option>
                        <option value="absent">Absent</option>
                        <option value="excused">Excused</option>
                      </select>
                    </td>
                    <td>
                      <input
                        className="sis-input"
                        value={draft.note}
                        onChange={(event) => updateDraft(student.id, { note: event.target.value })}
                        placeholder="Optional note"
                        disabled={!can("attendance.mark.school") && !can("attendance.mark.assigned")}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Absence follow-up</h2>
            <p className="sis-panel-subtitle">Recent late or absent entries that may need a parent notification.</p>
          </div>
        </div>

        {recentAlerts.length > 0 ? (
          <div className="sis-data-list">
            {recentAlerts.map((entry) => (
              <article className="sis-data-item" key={entry.id}>
                <div>
                  <div className="sis-data-heading">{entry.studentName}</div>
                  <div className="sis-data-meta">
                    {entry.grade} {entry.className} · {entry.date}
                  </div>
                  <div className="sis-data-meta">{entry.note || "No note added"}</div>
                </div>
                <div className="sis-data-side">{entry.status}</div>
              </article>
            ))}
          </div>
        ) : (
          <div className="sis-empty-state">No recent absences or lateness to follow up yet.</div>
        )}
      </section>
    </section>
  );
}
