"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useSession } from "../../components/SessionProvider";
import { loadManagedClasses, managedClassOptions, managedGradeOptions } from "../../classes/class-storage";
import { subjectOptions, termOptions } from "../../grades/grades-storage";
import { teacherOptions } from "../../timetable/timetable-storage";
import { subjectOptionsForClass } from "../../subjects/subject-storage";
import type { ExamSession, ExamSessionFormState } from "../calendar-storage";
import {
  deleteExamSession,
  examSessionTypes,
  examStatuses,
  examTimeOptions,
  initialExamSessionFormState,
  loadExamSessions,
  persistExamSessions,
  sortedExamSessions,
  toExamSessionFormState,
  upsertExamSession,
} from "../calendar-storage";

export default function ExamSchedulerConsole() {
  const { can } = useSession();
  const canManageExams = can("assessments.manage");
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [managedClasses, setManagedClasses] = useState(() => loadManagedClasses());
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [sessionForm, setSessionForm] = useState<ExamSessionFormState>(initialExamSessionFormState);
  const [teachers, setTeachers] = useState(() => teacherOptions());

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextTeachers = teacherOptions();
      const nextClasses = loadManagedClasses();
      setSessions(loadExamSessions());
      setTeachers(nextTeachers);
      setManagedClasses(nextClasses);
      setSessionForm((current) => ({
        ...current,
        grade: nextClasses[0]?.grade ?? current.grade,
        className: nextClasses[0]?.className ?? current.className,
        invigilatorTeacherId: nextTeachers[0]?.id ?? current.invigilatorTeacherId,
      }));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const orderedSessions = useMemo(() => sortedExamSessions(sessions), [sessions]);
  const activeClassId = useMemo(
    () => managedClasses.find((item) => item.grade === sessionForm.grade && item.className === sessionForm.className)?.id ?? "",
    [managedClasses, sessionForm.className, sessionForm.grade],
  );
  const availableGrades = useMemo(() => managedGradeOptions(managedClasses), [managedClasses]);
  const availableClasses = useMemo(() => managedClassOptions(managedClasses, sessionForm.grade), [managedClasses, sessionForm.grade]);
  const availableSubjects = useMemo(() => subjectOptionsForClass(activeClassId), [activeClassId]);
  const upcomingSessions = useMemo(
    () => orderedSessions.filter((session) => session.status !== "completed").slice(0, 12),
    [orderedSessions],
  );
  const summary = useMemo(() => {
    const publishedSessions = sessions.filter((session) => session.status === "published").length;
    const secondTryCount = sessions.filter((session) => session.sessionType === "Second Try").length;
    const firstTryCount = sessions.filter((session) => session.sessionType === "First Try").length;
    return {
      total: sessions.length,
      publishedSessions,
      secondTryCount,
      firstTryCount,
    };
  }, [sessions]);

  const invigilatorTeacherName =
    teachers.find((teacher) => teacher.id === sessionForm.invigilatorTeacherId)?.name ?? "Unassigned teacher";

  function updateSessionForm<K extends keyof ExamSessionFormState>(key: K, value: ExamSessionFormState[K]) {
    setSessionForm((current) => ({ ...current, [key]: value }));
  }

  function resetSessionForm() {
    setEditingSessionId(null);
    setSessionForm({
      ...initialExamSessionFormState,
      invigilatorTeacherId: teachers[0]?.id ?? "",
    });
  }

  function saveSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionForm.invigilatorTeacherId) {
      return;
    }

    startTransition(() => {
      setSessions((current) => {
        const next = upsertExamSession({
          currentSessions: current,
          form: sessionForm,
          editingId: editingSessionId,
          invigilatorTeacherName,
        });
        persistExamSessions(next);
        return next;
      });
      resetSessionForm();
    });
  }

  function editSession(session: ExamSession) {
    setEditingSessionId(session.id);
    setSessionForm(toExamSessionFormState(session));
  }

  function removeSession(id: string) {
    startTransition(() => {
      setSessions((current) => {
        const next = deleteExamSession(current, id);
        persistExamSessions(next);
        return next;
      });
      if (editingSessionId === id) {
        resetSessionForm();
      }
    });
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <p className="sis-panel-subtitle">
            Schedule exam sessions by term, subject, class, room, and session type, including supplementary `Second Try`
            exams for Mozambique grading follow-up.
          </p>
          <div className="sis-chip chip-syncing">
            {canManageExams ? "Exam scheduling active" : "Read-only exam schedule"}
          </div>
        </div>
        <div className="sis-kpi-strip">
        <Kpi label="Total sessions" value={`${summary.total}`} note="All scheduled exams" />
        <Kpi label="Published" value={`${summary.publishedSessions}`} note="Ready for school sharing" />
        <Kpi label="First Try" value={`${summary.firstTryCount}`} note="Primary exam round" />
        <Kpi label="Second Try" value={`${summary.secondTryCount}`} note="Supplementary sessions" />
        </div>
      </section>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <p className="sis-panel-subtitle">
              Create or update exam sessions by term, subject, class, room, time slot, and invigilator.
            </p>
          </div>
        </div>

        {canManageExams ? (
          <form className="sis-form" onSubmit={saveSession}>
            <div className="sis-form-grid">
              <label className="sis-field">
                <span className="sis-field-label">Term</span>
                <select className="sis-input sis-select" value={sessionForm.term} onChange={(input) => updateSessionForm("term", input.target.value as ExamSessionFormState["term"])}>
                  {termOptions.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Session</span>
                <select className="sis-input sis-select" value={sessionForm.sessionType} onChange={(input) => updateSessionForm("sessionType", input.target.value as ExamSessionFormState["sessionType"])}>
                  {examSessionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Grade</span>
                <select className="sis-input sis-select" value={sessionForm.grade} onChange={(input) => {
                  const nextGrade = input.target.value;
                  const nextClasses = managedClassOptions(managedClasses, nextGrade);
                  const nextClassName = nextClasses[0] ?? sessionForm.className;
                  const nextClassId =
                    managedClasses.find((item) => item.grade === nextGrade && item.className === nextClassName)?.id ?? "";
                  updateSessionForm("grade", nextGrade);
                  updateSessionForm("className", nextClassName);
                  updateSessionForm("subject", subjectOptionsForClass(nextClassId)[0] ?? subjectOptions()[0] ?? sessionForm.subject);
                }}>
                  {availableGrades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Class</span>
                <select className="sis-input sis-select" value={sessionForm.className} onChange={(input) => {
                  const nextClassName = input.target.value;
                  const nextClassId =
                    managedClasses.find((item) => item.grade === sessionForm.grade && item.className === nextClassName)?.id ?? "";
                  updateSessionForm("className", nextClassName);
                  updateSessionForm("subject", subjectOptionsForClass(nextClassId)[0] ?? subjectOptions()[0] ?? sessionForm.subject);
                }}>
                  {availableClasses.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Subject</span>
                <select className="sis-input sis-select" value={sessionForm.subject} onChange={(input) => updateSessionForm("subject", input.target.value as ExamSessionFormState["subject"])}>
                  {availableSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Exam date</span>
                <input className="sis-input" type="date" value={sessionForm.examDate} onChange={(input) => updateSessionForm("examDate", input.target.value)} />
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Start time</span>
                <select className="sis-input sis-select" value={sessionForm.startTime} onChange={(input) => updateSessionForm("startTime", input.target.value)}>
                  {examTimeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sis-field">
                <span className="sis-field-label">End time</span>
                <select className="sis-input sis-select" value={sessionForm.endTime} onChange={(input) => updateSessionForm("endTime", input.target.value)}>
                  {examTimeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Room</span>
                <input className="sis-input" value={sessionForm.room} onChange={(input) => updateSessionForm("room", input.target.value)} />
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Invigilator</span>
                <select className="sis-input sis-select" value={sessionForm.invigilatorTeacherId} onChange={(input) => updateSessionForm("invigilatorTeacherId", input.target.value)}>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Status</span>
                <select className="sis-input sis-select" value={sessionForm.status} onChange={(input) => updateSessionForm("status", input.target.value as ExamSessionFormState["status"])}>
                  {examStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="sis-form-actions">
              <button className="sis-button sis-button-primary" type="submit">
                {editingSessionId ? "Update exam session" : "Add exam session"}
              </button>
              {editingSessionId && (
                <button className="sis-button sis-button-secondary" type="button" onClick={resetSessionForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="sis-empty-state">Your role can view the exam schedule, but only authorized academic staff can edit sessions.</div>
        )}

        <div className="sis-divider" />

        <div className="sis-table-wrap">
          <table className="sis-table sis-table-light">
            <thead>
              <tr>
                <th>Session</th>
                <th>Class</th>
                <th>Date</th>
                <th>Invigilator</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingSessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <div className="sis-table-primary">{session.subject}</div>
                    <div className="sis-table-secondary">
                      {session.term} · {session.sessionType}
                    </div>
                  </td>
                  <td>
                    <div className="sis-table-primary">
                      {session.grade} {session.className}
                    </div>
                    <div className="sis-table-secondary">{session.room}</div>
                  </td>
                  <td>
                    <div className="sis-table-primary">{session.examDate}</div>
                    <div className="sis-table-secondary">
                      {session.startTime} - {session.endTime}
                    </div>
                  </td>
                  <td>{session.invigilatorTeacherName}</td>
                  <td>
                    <div className="sis-row-actions">
                      <span className={`sis-chip ${examChip(session.status, session.sessionType)}`}>{session.status}</span>
                      {canManageExams && (
                        <>
                          <button type="button" className="sis-table-action-button" onClick={() => editSession(session)}>
                            Edit
                          </button>
                          <button type="button" className="sis-table-action-button sis-table-action-button-warning" onClick={() => removeSession(session.id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {upcomingSessions.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="sis-empty-state">No exam sessions scheduled yet.</div>
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

function examChip(status: ExamSessionFormState["status"], sessionType: ExamSessionFormState["sessionType"]) {
  if (status === "completed") {
    return "chip-up";
  }
  if (sessionType === "Second Try") {
    return "chip-pending";
  }
  return status === "published" ? "chip-syncing" : "chip-pending";
}
