"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { loadManagedClasses, managedClassPairs } from "../classes/class-storage";
import {
  classAssignments,
  initialSubjectRows,
  loadSubjectAssignments,
  makeSubjectRow,
  persistSubjectAssignments,
  replaceSubjectsForClass,
  subjectTeacherOptions,
  SubjectAssignmentRow,
} from "./subject-storage";

export default function SubjectAssignmentForm() {
  const classId = useSearchParams().get("classId");
  const router = useRouter();
  const [selectedClassId, setSelectedClassId] = useState(classId ?? "");
  const [rows, setRows] = useState<SubjectAssignmentRow[]>(initialSubjectRows);

  const classPairs = useMemo(() => managedClassPairs(loadManagedClasses()), []);
  const teachers = useMemo(() => subjectTeacherOptions(), []);
  const selectedClass = classPairs.find((item) => item.id === selectedClassId) ?? classPairs[0] ?? null;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextPairs = managedClassPairs(loadManagedClasses());
      const targetClassId = classId ?? nextPairs[0]?.id ?? "";
      const existing = classAssignments(loadSubjectAssignments(), targetClassId);

      setSelectedClassId(targetClassId);
      if (existing.length > 0) {
        setRows(
          existing.map((item, index) => ({
            id: `subject-edit-${index + 1}-${item.id}`,
            subjectName: item.subjectName,
            teacherId: item.teacherId,
            examMarks: `${item.examMarks}`,
          })),
        );
      } else {
        setRows([
          {
            id: "subject-row-1",
            subjectName: "",
            teacherId: teachers[0]?.id ?? "",
            examMarks: "20",
          },
        ]);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [classId, teachers]);

  function updateRow(rowId: string, patch: Partial<SubjectAssignmentRow>) {
    setRows((current) => current.map((row) => (row.id === rowId ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((current) => [...current, { ...makeSubjectRow(current.length + 1), teacherId: teachers[0]?.id ?? "" }]);
  }

  function removeRow(rowId: string) {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.id !== rowId) : current));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedClass) {
      return;
    }

    startTransition(() => {
      const current = loadSubjectAssignments();
      const next = replaceSubjectsForClass({
        currentAssignments: current,
        classId: selectedClass.id,
        grade: selectedClass.grade,
        className: selectedClass.className,
        rows,
      });
      persistSubjectAssignments(next);
      router.push("/sis/subjects");
    });
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <section className="sis-panel sis-panel-light sis-form-panel-narrow">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Create subjects</h2>
            <p className="sis-panel-subtitle">These assignments become available in grades, timetable, and exam scheduler.</p>
          </div>
          <div className="sis-row-actions sis-row-actions-wrap">
            <Link href="/sis/subjects" className="sis-button sis-button-secondary">
              Back to subjects
            </Link>
            <div className="sis-chip chip-syncing">{selectedClass?.displayName ?? "No class selected"}</div>
          </div>
        </div>

        <form className="sis-form" onSubmit={handleSubmit}>
          <label className="sis-field">
            <span className="sis-field-label">Select class</span>
            <select className="sis-input sis-select" value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
              {classPairs.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.displayName}
                </option>
              ))}
            </select>
          </label>

          <div className="sis-subject-assignment-list">
            {rows.map((row, index) => (
              <div className="sis-subject-assignment-row" key={row.id}>
                <label className="sis-field">
                  <span className="sis-field-label">Subject {index + 1}</span>
                  <input
                    className="sis-input"
                    value={row.subjectName}
                    onChange={(event) => updateRow(row.id, { subjectName: event.target.value })}
                    placeholder="Subject name"
                  />
                </label>

                <label className="sis-field">
                  <span className="sis-field-label">Teacher</span>
                  <select className="sis-input sis-select" value={row.teacherId} onChange={(event) => updateRow(row.id, { teacherId: event.target.value })}>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="sis-field">
                  <span className="sis-field-label">Marks</span>
                  <input
                    className="sis-input"
                    type="number"
                    min="0"
                    value={row.examMarks}
                    onChange={(event) => updateRow(row.id, { examMarks: event.target.value })}
                    placeholder="20"
                  />
                </label>

                <button type="button" className="sis-button sis-button-ghost" onClick={() => removeRow(row.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="sis-form-actions sis-form-actions-space">
            <button type="button" className="sis-button sis-button-secondary" onClick={addRow}>
              Add more
            </button>
            <button type="submit" className="sis-button sis-button-primary">
              Assign subjects
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}
