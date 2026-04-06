"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import {
  deleteTimetableEntry,
  initialTimetableFormState,
  loadTimetableEntries,
  persistTimetableEntries,
  teacherOptions,
  timetableClassOptions,
  timetableConflicts,
  timetableDays,
  timeOptions,
  TimetableEntry,
  TimetableFormState,
  toTimetableFormState,
  upsertTimetableEntry,
  sortTimetableEntries,
} from "../timetable-storage";
import { loadManagedClasses } from "../../classes/class-storage";
import { subjectOptionsForClass } from "../../subjects/subject-storage";

export default function TimetableEditorConsole() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [teacherList, setTeacherList] = useState(() => teacherOptions());
  const [classPairs, setClassPairs] = useState(() => timetableClassOptions());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TimetableFormState>(initialTimetableFormState);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextEntries = loadTimetableEntries();
      const nextTeachers = teacherOptions();
      const nextClassPairs = timetableClassOptions();
      const nextClassId = loadManagedClasses().find(
        (item) => item.grade === nextClassPairs[0]?.grade && item.className === nextClassPairs[0]?.className,
      )?.id ?? "";
      const nextSubjects = subjectOptionsForClass(nextClassId);

      setEntries(nextEntries);
      setTeacherList(nextTeachers);
      setClassPairs(nextClassPairs);
      setForm((current) => ({
        ...current,
        grade: nextClassPairs[0]?.grade ?? current.grade,
        className: nextClassPairs[0]?.className ?? current.className,
        subject: nextSubjects.includes(current.subject) ? current.subject : nextSubjects[0] ?? current.subject,
        teacherId: nextTeachers[0]?.id ?? current.teacherId,
      }));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const sortedEntries = useMemo(() => sortTimetableEntries(entries), [entries]);
  const recentEntries = useMemo(() => sortedEntries.slice(0, 10), [sortedEntries]);
  const conflicts = useMemo(() => timetableConflicts(entries), [entries]);
  const teacherName = teacherList.find((teacher) => teacher.id === form.teacherId)?.name ?? "Unassigned teacher";
  const activeClassId = useMemo(
    () => loadManagedClasses().find((item) => item.grade === form.grade && item.className === form.className)?.id ?? "",
    [form.className, form.grade],
  );
  const subjectList = useMemo(() => subjectOptionsForClass(activeClassId), [activeClassId]);

  function resetForm() {
    setEditingId(null);
    setForm({
      ...initialTimetableFormState,
      grade: classPairs[0]?.grade ?? initialTimetableFormState.grade,
      className: classPairs[0]?.className ?? initialTimetableFormState.className,
      teacherId: teacherList[0]?.id ?? "",
    });
  }

  function updateForm<K extends keyof TimetableFormState>(key: K, value: TimetableFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function saveEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.teacherId) {
      return;
    }

    startTransition(() => {
      setEntries((current) => {
        const next = upsertTimetableEntry({
          currentEntries: current,
          form,
          editingId,
          teacherName,
        });
        persistTimetableEntries(next);
        return next;
      });
      resetForm();
    });
  }

  function editEntry(entry: TimetableEntry) {
    setEditingId(entry.id);
    setForm(toTimetableFormState(entry));
  }

  function removeEntry(entryId: string) {
    startTransition(() => {
      setEntries((current) => {
        const next = deleteTimetableEntry(current, entryId);
        persistTimetableEntries(next);
        return next;
      });
      if (editingId === entryId) {
        resetForm();
      }
    });
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <p className="sis-panel-subtitle">
            Create and adjust lesson slots for each class, teacher, subject, room, and time block. Use this page for
            all timetable changes, then review the weekly result from the view page.
          </p>
          <div className="sis-employees-toolbar">
          <Link className="sis-button sis-button-secondary" href="/sis/timetable">
            Back to view timetable
          </Link>
          <div className="sis-chip chip-pending">{conflicts.length} conflicts</div>
        </div>
        </div>
        <div className="sis-kpi-strip">
        <Kpi label="Scheduled slots" value={`${entries.length}`} note="All weekly timetable entries" />
        <Kpi label="Teacher pool" value={`${teacherList.length}`} note="Active teachers available" />
        <Kpi label="Class groups" value={`${classPairs.length}`} note="Detected from student roster" />
        <Kpi label="Overlap alerts" value={`${conflicts.length}`} note="Teacher or class clashes" />
        </div>
      </section>

      <div className="sis-workspace-grid">
        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Schedule editor</h2>
              <p className="sis-panel-subtitle">
                Create or update lesson slots with class, subject, teacher, room, and time block.
              </p>
            </div>
          </div>

          <form className="sis-form" onSubmit={saveEntry}>
            <div className="sis-form-grid">
              <label className="sis-field">
                <span className="sis-field-label">Day</span>
                <select className="sis-input sis-select" value={form.day} onChange={(event) => updateForm("day", event.target.value as TimetableFormState["day"])}>
                  {timetableDays.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Subject</span>
                <select className="sis-input sis-select" value={form.subject} onChange={(event) => updateForm("subject", event.target.value as TimetableFormState["subject"])}>
                  {subjectList.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Start time</span>
                <select className="sis-input sis-select" value={form.startTime} onChange={(event) => updateForm("startTime", event.target.value)}>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sis-field">
                <span className="sis-field-label">End time</span>
                <select className="sis-input sis-select" value={form.endTime} onChange={(event) => updateForm("endTime", event.target.value)}>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Grade</span>
                <select className="sis-input sis-select" value={form.grade} onChange={(event) => {
                  const nextGrade = event.target.value;
                  const nextClassName =
                    classPairs.filter((pair) => pair.grade === nextGrade)[0]?.className ?? form.className;
                  const nextClassId =
                    loadManagedClasses().find((item) => item.grade === nextGrade && item.className === nextClassName)?.id ?? "";
                  const nextSubjects = subjectOptionsForClass(nextClassId);
                  updateForm("grade", nextGrade);
                  updateForm("className", nextClassName);
                  updateForm("subject", nextSubjects.includes(form.subject) ? form.subject : nextSubjects[0] ?? form.subject);
                }}>
                  {Array.from(new Set(classPairs.map((pair) => pair.grade))).map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Class</span>
                <select className="sis-input sis-select" value={form.className} onChange={(event) => {
                  const nextClassName = event.target.value;
                  const nextClassId =
                    loadManagedClasses().find((item) => item.grade === form.grade && item.className === nextClassName)?.id ?? "";
                  const nextSubjects = subjectOptionsForClass(nextClassId);
                  updateForm("className", nextClassName);
                  updateForm("subject", nextSubjects.includes(form.subject) ? form.subject : nextSubjects[0] ?? form.subject);
                }}>
                  {classPairs
                    .filter((pair) => pair.grade === form.grade)
                    .map((pair) => (
                      <option key={`${pair.grade}-${pair.className}`} value={pair.className}>
                        {pair.className}
                      </option>
                    ))}
                </select>
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Teacher</span>
                <select className="sis-input sis-select" value={form.teacherId} onChange={(event) => updateForm("teacherId", event.target.value)}>
                  {teacherList.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Room</span>
                <input className="sis-input" value={form.room} onChange={(event) => updateForm("room", event.target.value)} />
              </label>

              <label className="sis-field sis-field-span-2">
                <span className="sis-field-label">Notes</span>
                <textarea
                  className="sis-input sis-textarea"
                  value={form.notes}
                  onChange={(event) => updateForm("notes", event.target.value)}
                  placeholder="Optional lesson note or grouping detail"
                />
              </label>
            </div>

            <div className="sis-form-actions">
              <button className="sis-button sis-button-primary" type="submit">
                {editingId ? "Update slot" : "Add lesson slot"}
              </button>
              {(editingId || form.notes || form.room !== initialTimetableFormState.room) && (
                <button className="sis-button sis-button-secondary" type="button" onClick={resetForm}>
                  Reset
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Recent timetable slots</h2>
              <p className="sis-panel-subtitle">
                Edit or delete existing lesson slots, and keep an eye on potential overlap issues.
              </p>
            </div>
          </div>

          <div className="sis-data-list">
            {recentEntries.length > 0 ? (
              recentEntries.map((entry) => (
                <article className="sis-data-item" key={entry.id}>
                  <div>
                    <div className="sis-data-heading">
                      {entry.day} · {entry.startTime} - {entry.endTime}
                    </div>
                    <div className="sis-data-meta">
                      {entry.subject} · {entry.grade} {entry.className} · {entry.teacherName}
                    </div>
                    <div className="sis-data-meta">
                      {entry.room}
                      {entry.notes ? ` · ${entry.notes}` : ""}
                    </div>
                  </div>
                  <div className="sis-row-actions">
                    <button type="button" className="sis-table-action-button" onClick={() => editEntry(entry)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="sis-table-action-button sis-table-action-button-warning"
                      onClick={() => removeEntry(entry.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="sis-empty-state">No timetable slots have been created yet.</div>
            )}
          </div>

          <div className="sis-divider" />

          <div className="sis-data-list">
            {conflicts.length > 0 ? (
              conflicts.slice(0, 5).map((entry) => (
                <article className="sis-data-item" key={`${entry.id}-conflict`}>
                  <div>
                    <div className="sis-data-heading">
                      Conflict · {entry.day} {entry.startTime}
                    </div>
                    <div className="sis-data-meta">
                      {entry.subject} · {entry.grade} {entry.className} · {entry.teacherName}
                    </div>
                  </div>
                  <div className="sis-data-side">{entry.room}</div>
                </article>
              ))
            ) : (
              <div className="sis-empty-state">No timetable conflicts detected right now.</div>
            )}
          </div>
        </section>
      </div>
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
